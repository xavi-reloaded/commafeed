/**
 * Created by jonny on 01/09/13.
 */
function createExtractorView($scope,$timeout,$compile,$window){

    $scope.opts = {
        backdropClick: false,
        backdrop: 'static',
        keyboard: false,
        backdropFade: false,
        dialogFade: true
    };

    $scope.analyzing = function(){
        return (!$scope.htmlResponse && !$scope.manuallyInsertedText)
    }

    $scope.init = function(){
        $scope.charLimit = 10000;
        $scope.infoPopupOpen = false;
        $scope.result = [];
        $scope.mainText =
            'Luís Alves de Lima e Silva, Duke of Caxias (1803–80) was an army officer, ' +
                'politician and monarchist of the Empire of Brazil. ' +
                'politician and monarchist of the Empire of Brazil. ' +
                'He fought against Portugal during the Brazilian War for Independence, ' +
                'and thereafter remained loyal to the emperors Dom Pedro I and his son, ' +
                'Dom Pedro II (to whom he became a friend and instructor in swordsmanship and horsemanship). ' +
                'He commanded forces that put down uprisings from 1839 to 1845, including the Balaiada and the War of the Ragamuffins. ' +
                'He led the Brazilian army to victory in the Platine War against the Argentine Confederation and in the Paraguayan War against the Paraguayans. ' +
                'Caxias was promoted to army marshal, the army\'s highest rank, and was the only person made a duke during the 58-year reign of Pedro II. ' +
                'A member of the Reactionary Party (which became the Conservative Party), ' +
                'he was elected senator in 1846 and served as president (prime minister) of the Council of Ministers three times. ' +
                'Historians have regarded Caxias in a positive light and several have ranked him as the greatest Brazilian military officer. ' +
                'He has been designated as the army\'s protector, and is regarded as the most important figure in its tradition.';

        $scope.initialText = $scope.mainText;
        $scope.page = {
            title: 'Ejemplo de extracción y análisis de keywords'
        };
        $scope.screenOnFront = 0;
        $scope.showProgressElement = '' +
            '<li class="show-progress">' +
            '   <div class="hero-unit">' +
            '       <h1>' + $scope.page.title + '</h1>' +
            '       <p><span></span></p>' +
            '   </div>' +
            '       <span class="container">' +
            '           <aula-progressbar scale="10" value="10"></aula-progressbar>' +
            '       </span>' +
            '</li>';
        $scope.keywordLemmaStatusOpen="";
    }

    $scope.getAnalyzeData = function(){
        $scope.limitMainText();
        var data = {
            language :"en",
            phrase: $scope.mainText
        };
        if (data.phrase==''){
            return false;
        }
        return data;
    }
    $scope.clear = function(){
        $scope.mainText = ' ';
        $scope.result = [];
        $scope.manuallyInsertedText = false;
        $scope.charLimitExceeded = false;
        $scope.previewMode = false;
        $('iframe').contents().find('body').contents().find('iframe').contents().find('body').focus();
    }
    $scope.reset = function(){
        $scope.mainText = $scope.initialText;
        $scope.result = [];
    }

    $scope.wgetClean = function(){
        var phrase=$scope.url;
        if (phrase==''){
            return false;
        }
        return phrase;
    }
    $scope.afterAnalyzing = function(res){
        $scope.result = res;
        $scope.previewMode = true;
        $scope.closeInfoPopup();
    }
    $scope.afterWGetClean = function(res){
        $scope.onClear();
        $scope.closeInfoPopup();
        if (res.error!="") {
            return;
        }

        $scope.mainText = res.resolverResult;

        $scope.limitMainText();
        console.log(res.resolverResult);
        $scope.htmlResponse = true;
        $scope.onAnalyze();

    }

    $scope.getHits = function(keyword){
        var hits = 0;
        for(var i=0;i<keyword.meannings.length;i++)
        {
            hits = keyword.meannings[i].interval.length + hits;
        }
        return hits;
    }
    $scope.hasResponse = function(keyword){
        if (keyword.searchResponse.length>0) return true;
        return false;
    }
    $scope.openInfoPopup = function(){
        $scope.infoPopupOpen = true;
    }
    $scope.closeInfoPopup = function(){
        $scope.infoPopupOpen = false;
        $scope.htmlResponse = false;
        $scope.manuallyInsertedText = false;
    }
    $scope.cancelInfoPopup = function(){
        $scope.result = [];
        $scope.infoPopupOpen = false;
        $scope.htmlResponse = false;
    }
    $scope.limitMainText = function(){
        if($scope.mainText.length>$scope.charLimit){
            $scope.mainText = $scope.mainText.substring(0, $scope.charLimit);
            $scope.charLimitExceeded = true;
        }
    }

    $scope.actionOnPreview = function(){
        var epiceditorViewerFrame = angular.element("iframe").contents().find("iframe")[1];
        epiceditorViewerFrame.contentWindow.funcInViewer('k14_18');
    }

    $scope.keywordIsOpen = function(lemma){
        return (lemma==$scope.keywordLemmaStatusOpen) ? true : false;

    }

    //TO LET COMUNICATION WITH NESTED INNER IFRAME -------------------------------------------------
    $window.getKeywordsResult = function(){
        return $scope.result
    }

    $window.showKeywordPopOver = function(evt){
        $('body').find('i').keywordviewer('destroy');
        if (!evt.srcElement) {
            return;
        }
        elem = evt.srcElement;

        if (elem.tagName=='SPAN') {
            var i = document.createElement("i");
            $(i).css({
                position: "absolute",
                top: ($('iframe').position().top + $('div.activity-container').position().top + evt.offsetY ) + "px",
                left: ($('iframe').position().left + $('div.activity-container').position().left + evt.offsetX ) + "px",
                height: evt.target.offsetHeight + "px",
                width: evt.target.offsetWidth +"px"
            }).show();
            $('body').append(i);
            var id = evt.target.id;
            var result = $scope.result;
            var keywordObject= $scope.getKeywordObjectFromSpanId(result, id);
            $(i).keywordviewer({ keyword: keywordObject.keyword });
            $(i).keywordviewer('show');
        }
    }
    $scope.getKeywordObjectFromSpanId = function (keywords, spainId) {
        for (var x=0;x<keywords.length;x++){
            var lemma = keywords[x].lemma;
            for (var xx=0;xx<keywords[x].meannings.length;xx++){
                var concept = keywords[x].meannings[xx].concept;
                for (var xxx=0;xxx<keywords[x].meannings[xx].interval.length;xxx++){

                    var start = keywords[x].meannings[xx].interval[xxx].start;
                    var end = keywords[x].meannings[xx].interval[xxx].end;
                    if ('k'+start+'_'+end == spainId) {
                        return {keyword: keywords[x], freq: keywords[x].meannings[xx].interval.length};
                    }

                }
            }
        }
        return {keyword:{keyword:{categories:""},lemma:"NANAI DE LA CHINA"},freq:0};
    };







    //VISUAL EFFECTS -------------------------------------------------
    $scope.getTopValueForNextPosition = function(initialPosition){
        var lastPosition = $('ul#timeline').children().size();
        if (initialPosition>=lastPosition) return (lastPosition-1)*100;
        return (initialPosition) * 100;
    };
    $scope.getTopValueForBackPosition = function(initialPosition){
        var lastPosition = $('ul#timeline').children().size();
        if (initialPosition<=2) return 0;
        return (initialPosition-2) * 100;
    };
    $scope.nextElementIsTransition = function (positionInTimeline) {
        return 0;
    };
    $scope.next = function(){

        var showProgressElement = $compile($scope.showProgressElement)($scope);

        console.log('before compilation:'+showProgressElement.html());


        var positionInTimeline = $scope.getInitialPositionInULelementFromTopValue($scope.screenOnFront);
        $scope.insertAt(positionInTimeline+1, $('ul#timeline'), '<li class="show-progress">' + showProgressElement.html() + '</li>');
        $scope.screenOnFront = $scope.getTopValueForNextPosition(positionInTimeline+1);

        $timeout(function() {
            $scope.screenOnFront = $scope.getTopValueForNextPosition(positionInTimeline+2);
        }, 2000);
    };
    $scope.getInitialPositionInULelementFromTopValue = function(topValue){
        return topValue/100;
    }
    $scope.back = function(activityId){
        if (activityId==1) {
            $('li.show-progress').remove();
            $scope.screenOnFront = 0;
        } else {
            $('ul#timeline').children('li').eq( ( activityId + (activityId-1) ) - 1).remove();
            $scope.screenOnFront = $scope.screenOnFront-200;
        }
    };

    $scope.continue = function(steps){
        $scope.screenOnFront = $scope.screenOnFront+100;

    };

    $scope.insertAt = function(index, parentElement, childElement) {
        var lastIndex = parentElement.children().size();
        if (index < 0) {
            index = Math.max(0, lastIndex + 1 + index)
        }
        parentElement.append(childElement)
        if (index < lastIndex) {
            parentElement.children().eq(index).before(parentElement.children().last())
        }
        return index;
    }

    $scope.switchSidebar = function(){
        $('#aula-trainning').toggleClass('fullscreen');
        $('#sideBarImage').toggleClass('icon-forward');
        $('#sideBarImage').toggleClass('icon-backward');
    }

    $scope.markAsCompleted = function(activityId){
        var activities = $scope.activities;
        for (var i = 0, ii = activities.length; i < ii; i++) {
            if (activityId == activities[i].id) {
                activities[i].completed=!activities[i].completed
            }
        }
    }

    return $scope;

}