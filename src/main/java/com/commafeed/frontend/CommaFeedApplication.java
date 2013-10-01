package com.commafeed.frontend;

import com.commafeed.backend.services.ApplicationPropertiesService;
import com.commafeed.backend.services.ApplicationSettingsService;
import com.commafeed.frontend.pages.*;
import com.commafeed.frontend.utils.WicketUtils;
import com.commafeed.frontend.utils.exception.DisplayExceptionPage;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.apache.wicket.*;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.authentication.strategy.DefaultAuthenticationStrategy;
import org.apache.wicket.authorization.Action;
import org.apache.wicket.authorization.IAuthorizationStrategy;
import org.apache.wicket.authroles.authentication.AbstractAuthenticatedWebSession;
import org.apache.wicket.authroles.authentication.AuthenticatedWebApplication;
import org.apache.wicket.authroles.authorization.strategies.role.Roles;
import org.apache.wicket.cdi.CdiConfiguration;
import org.apache.wicket.cdi.CdiContainer;
import org.apache.wicket.cdi.ConversationPropagation;
import org.apache.wicket.core.request.handler.PageProvider;
import org.apache.wicket.core.request.handler.RenderPageRequestHandler;
import org.apache.wicket.core.request.handler.RenderPageRequestHandler.RedirectPolicy;
import org.apache.wicket.markup.head.IHeaderResponse;
import org.apache.wicket.markup.head.filter.JavaScriptFilteredIntoFooterHeaderResponse;
import org.apache.wicket.markup.html.IHeaderResponseDecorator;
import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.request.*;
import org.apache.wicket.request.component.IRequestableComponent;
import org.apache.wicket.request.cycle.AbstractRequestCycleListener;
import org.apache.wicket.request.cycle.RequestCycle;
import org.apache.wicket.request.cycle.RequestCycleContext;
import org.apache.wicket.util.cookies.CookieUtils;

import javax.enterprise.inject.spi.BeanManager;
import javax.inject.Inject;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.http.Cookie;

@Slf4j
public class CommaFeedApplication extends AuthenticatedWebApplication {

	@Inject
	ApplicationSettingsService applicationSettingsService;

	public CommaFeedApplication() {
		super();
		boolean prod = ApplicationPropertiesService.get().isProduction();
		setConfigurationType(prod ? RuntimeConfigurationType.DEPLOYMENT : RuntimeConfigurationType.DEVELOPMENT);
	}

	@Override
	protected void init() {
		super.init();
		setupInjection();
		setupSecurity();

		mountPage("welcome", WelcomePage.class);
		mountPage("demo", DemoLoginPage.class);
		mountPage("keywords", KeywordPage.class);

		mountPage("recover", PasswordRecoveryPage.class);
		mountPage("recover2", PasswordRecoveryCallbackPage.class);

		mountPage("logout", LogoutPage.class);
		mountPage("error", DisplayExceptionPage.class);

		mountPage("next", NextUnreadRedirectPage.class);

		getMarkupSettings().setStripWicketTags(true);
		getMarkupSettings().setCompressWhitespace(true);
		getMarkupSettings().setDefaultMarkupEncoding("UTF-8");

		setHeaderResponseDecorator(new IHeaderResponseDecorator() {
			@Override
			public IHeaderResponse decorate(IHeaderResponse response) {
				return new JavaScriptFilteredIntoFooterHeaderResponse(response, "footer-container");
			}
		});

		getRequestCycleListeners().add(new AbstractRequestCycleListener() {
			@Override
			public IRequestHandler onException(RequestCycle cycle, Exception ex) {
				AjaxRequestTarget target = cycle.find(AjaxRequestTarget.class);
				// redirect to the error page if ajax request, render error on current page otherwise
				RedirectPolicy policy = target == null ? RedirectPolicy.NEVER_REDIRECT : RedirectPolicy.AUTO_REDIRECT;
				return new RenderPageRequestHandler(new PageProvider(new DisplayExceptionPage(ex)), policy);
			}
		});

		setRequestCycleProvider(new IRequestCycleProvider() {
			@Override
			public RequestCycle get(RequestCycleContext context) {
				return new RequestCycle(context) {
					@Override
					protected UrlRenderer newUrlRenderer() {
						return new UrlRenderer(getRequest()) {
							@Override
							public String renderUrl(Url url) {
								// override wicket's relative-to-absolute url conversion with what we know is the correct protocol
								String publicUrl = applicationSettingsService.get().getPublicUrl();
								if (StringUtils.isNotBlank(publicUrl)) {
									Url parsed = Url.parse(publicUrl);
									url.setProtocol(parsed.getProtocol());
									url.setPort(parsed.getPort());
								}
								return super.renderUrl(url);
							}
						};
					}
				};
			}
		});
	}

	private void setupSecurity() {
		getSecuritySettings().setAuthenticationStrategy(new DefaultAuthenticationStrategy("LoggedIn") {

			private CookieUtils cookieUtils = null;

			@Override
			protected CookieUtils getCookieUtils() {

				if (cookieUtils == null) {
					cookieUtils = new CookieUtils() {
						@Override
						protected void initializeCookie(Cookie cookie) {
							super.initializeCookie(cookie);
							cookie.setHttpOnly(true);
						}
					};
				}
				return cookieUtils;
			}
		});
		getSecuritySettings().setAuthorizationStrategy(new IAuthorizationStrategy() {

			@Override
			public <T extends IRequestableComponent> boolean isInstantiationAuthorized(Class<T> componentClass) {
				boolean authorized = true;

				boolean restricted = componentClass.isAnnotationPresent(SecurityCheck.class);
				if (restricted) {
					SecurityCheck annotation = componentClass.getAnnotation(SecurityCheck.class);
					Roles roles = CommaFeedSession.get().getRoles();
					authorized = roles.hasAnyRole(new Roles(annotation.value().name()));
				}
				return authorized;
			}

			@Override
			public boolean isActionAuthorized(Component component, Action action) {
				return true;
			}
		});
	}

	@Override
	public Class<? extends Page> getHomePage() {
		return KeywordPage.class;
	}

	protected void setupInjection() {
		try {
			BeanManager beanManager = (BeanManager) new InitialContext().lookup("java:comp/BeanManager");
			CdiContainer container = new CdiConfiguration(beanManager).setPropagation(ConversationPropagation.NONE).configure(this);
			container.getNonContextualManager().inject(this);
		} catch (NamingException e) {
			log.warn("Could not locate bean manager. CDI is disabled.");
		}
	}

	@Override
	public void restartResponseAtSignInPage() {
		// preserve https if it was set
		RequestCycle.get().getUrlRenderer().setBaseUrl(Url.parse(WicketUtils.getClientFullUrl()));
		super.restartResponseAtSignInPage();
	}

	@Override
	public Session newSession(Request request, Response response) {
		return new CommaFeedSession(request);
	}

	@Override
	protected Class<? extends WebPage> getSignInPageClass() {
		return WelcomePage.class;
	}

	@Override
	protected Class<? extends AbstractAuthenticatedWebSession> getWebSessionClass() {
		return CommaFeedSession.class;
	}

	public static CommaFeedApplication get() {

		return (CommaFeedApplication) Application.get();
	}
}
