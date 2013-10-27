var app = angular.module('commafeed', ['ui', 'ui.bootstrap', 'ui.state', 'commafeed.directives', 'commafeed.controllers',
		'commafeed.services', 'commafeed.filters', 'ngSanitize', 'infinite-scroll', 'ngGrid']);

app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$httpProvider', '$compileProvider',
		function($routeProvider, $stateProvider, $urlRouterProvider, $httpProvider, $compileProvider) {

			$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
			var interceptor = ['$rootScope', '$q', function(scope, $q) {

				var success = function(response) {
					return response;
				};
				var error = function(response) {
					var status = response.status;
					if (status == 401) {
						window.location = 'logout';
						return;
					} else {
						return $q.reject(response);
					}
				};

				var promise = function(promise) {
					return promise.then(success, error);
				};

				return promise;
			}];

			$httpProvider.responseInterceptors.push(interceptor);

			$stateProvider.state('feeds', {
				'abstract' : true,
				url : '/feeds',
				templateUrl : 'templates/feeds.html'
			});
			$stateProvider.state('feeds.view', {
				url : '/view/:_type/:_id',
				templateUrl : 'templates/feeds.view.html',
				controller : 'FeedListCtrl'
			});
			$stateProvider.state('feeds.search', {
				url : '/search/:_keywords',
				templateUrl : 'templates/feeds.view.html',
				controller : 'FeedListCtrl'
			});
			$stateProvider.state('feeds.feed_details', {
				url : '/details/feed/:_id',
				templateUrl : 'templates/feeds.feed_details.html',
				controller : 'FeedDetailsCtrl'
			});
			$stateProvider.state('feeds.category_details', {
				url : '/details/category/:_id',
				templateUrl : 'templates/feeds.category_details.html',
				controller : 'CategoryDetailsCtrl'
			});
			$stateProvider.state('youkeyword.help', {
				url : '/help',
				templateUrl : 'templates/feeds.help.html',
				controller : 'HelpController'
			});
			$stateProvider.state('youkeyword.settings', {
				url : '/settings',
				templateUrl : 'templates/settings.html',
				controller : 'SettingsCtrl'
			});
			$stateProvider.state('youkeyword.profile', {
				url : '/profile',
				templateUrl : 'templates/profile.html',
				controller : 'ProfileCtrl'
			});

			$stateProvider.state('admin', {
				'abstract' : true,
				url : '/admin',
				templateUrl : 'templates/admin.html'
			});
			$stateProvider.state('admin.userlist', {
				url : '/user/list',
				templateUrl : 'templates/admin.userlist.html',
				controller : 'ManageUsersCtrl'
			});
			$stateProvider.state('admin.useradd', {
				url : '/user/add',
				templateUrl : 'templates/admin.useradd.html',
				controller : 'ManageUserCtrl'
			});
			$stateProvider.state('admin.useredit', {
				url : '/user/edit/:_id',
				templateUrl : 'templates/admin.useredit.html',
				controller : 'ManageUserCtrl'
			});
			$stateProvider.state('admin.duplicate_feeds', {
				url : '/feeds/duplicates',
				templateUrl : 'templates/admin.duplicate_feeds.html',
				controller : 'ManageDuplicateFeedsCtrl'
			});
			$stateProvider.state('admin.settings', {
				url : '/settings',
				templateUrl : 'templates/admin.settings.html',
				controller : 'ManageSettingsCtrl'
			});
			$stateProvider.state('admin.metrics', {
				url : '/metrics',
				templateUrl : 'templates/admin.metrics.html',
				controller : 'MetricsCtrl'
			});
			$stateProvider.state('keywords', {
			url : '/keywords',
			templateUrl : 'templates/keywords.html',
			controller : 'KeywordsController'
			});

			$urlRouterProvider.when('/', '/keywords');
			$urlRouterProvider.when('/admin', '/admin/settings');
			$urlRouterProvider.otherwise('/');

            $httpProvider.defaults.useXDomain = true;
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
            $httpProvider.defaults.transformRequest = function(data){
                if (data === undefined) {
                    return data;
                }
                return $.param(data);
            };
            delete $httpProvider.defaults.headers.common['X-Requested-With'];

		}]);
