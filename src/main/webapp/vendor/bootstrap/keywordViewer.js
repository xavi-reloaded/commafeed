

+function ($) { "use strict";

    // POPOVER PUBLIC CLASS DEFINITION
    // ===============================

    var KeywordViewer = function (element, options) {
        this.init('keywordviewer', element, options)
    }

    if (!$.fn.tooltip) throw new Error('KeywordViewer requires tooltip.js')

    KeywordViewer.DEFAULTS = $.extend({} , $.fn.tooltip.Constructor.DEFAULTS, {
          trigger: 'click'
        , selector: true
        , placement:'auto top'
        , container: 'body'
        , toggle:'popover'
        , html:true
        , keyword:{lemma:''}
        , template: '<div class="popover span10"><div class="arrow"></div><h3 class="popover-title text-success"></h3><div class="popover-content"></div></div>'
    })


    // NOTE: POPOVER EXTENDS tooltip.js
    // ================================

    KeywordViewer.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

    KeywordViewer.prototype.constructor = KeywordViewer

    KeywordViewer.prototype.getDefaults = function () {
        return KeywordViewer.DEFAULTS
    }

    KeywordViewer.prototype.setContent = function () {
        var $tip    = this.tip()
        var title   = this.getTitle()
        var content = this.getContent()

        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
        $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)

        $tip.removeClass('fade top bottom left right in')

        // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
        // this manually by checking the contents.
        if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
    }

    KeywordViewer.prototype.hasContent = function () {
        return this.getTitle() || this.getContent()
    }

    KeywordViewer.prototype.getTitle = function () {
        var $e = this.$element
        var o  = this.options
        return "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+o.keyword.lemma+"";
    }

    KeywordViewer.prototype.getContent = function () {
        var $e = this.$element
        var o  = this.options
        var carouselDiv = this.getCarouselHTMLfromKeyword(o.keyword);
        return  carouselDiv;
    }

    KeywordViewer.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find('.arrow')
    }

    KeywordViewer.prototype.tip = function () {
        if (!this.$tip) this.$tip = $(this.options.template)
        return this.$tip
    }

    KeywordViewer.prototype.getCarouselHTMLfromKeyword = function(keyword){
        var dicts = '', categories= '', cont=0;
        if (keyword.categories!="") {
            categories =  (keyword.categories=="") ? "" : '<div class="active item">' +
                '<h3>Wikipedia Categories</h3>' +
                '<div class="text-info pre-scrollable" style="height: 150px;">' + keyword.categories + '</div></div>';
            cont++;
        }
        if (keyword.searchResponse) {
            for (var x=0;x<keyword.searchResponse.length;x++) {
                dicts = dicts + '<div class="item '+((categories==''&&dicts=='')?'active':'')+'">' +
                    '<h3>'+keyword.searchResponse[x].src+'</h3>' +
                    '<div class="text-info pre-scrollable" style="height: 150px;">'+keyword.searchResponse[x].definition+'</div></div>';
                cont++;
            }
        }
        var navigator = (cont>1) ? '<a class="cc-control left"  href="#cc" data-slide="prev">&lsaquo;</a>' +
                        '<a class="cc-control right" href="#cc"  data-slide="next">&rsaquo;</a>' : '';

        var inner = (categories + dicts);
        inner = (inner=='') ? '<div class="active item"><h3 class="text-error text-center">' +
            'Sorry, '+
            '<span class="text-info">\"'+keyword.lemma+'\"</span>' +
            ' does not seems to be an important keyword.' +
            '</h3></div>' :
            inner;
        var carouselDiv = '<div id="cc" class="carousel slide" style="height: 200px;">' +
                            '<div class="carousel-inner">' + inner + '</div>' + navigator +
                          '</div>';
        return carouselDiv;
    }


    // POPOVER PLUGIN DEFINITION
    // =========================

    var old = $.fn.keywordviewer

    $.fn.keywordviewer = function (option) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('bs.popover')
            var options = typeof option == 'object' && option
            if (!data) $this.data('bs.popover', (data = new KeywordViewer(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.keywordviewer.Constructor = KeywordViewer

    // POPOVER NO CONFLICT
    // ===================

    $.fn.keywordviewer.noConflict = function () {
        $.fn.keywordviewer = old
        return this
    }

}(window.jQuery);
