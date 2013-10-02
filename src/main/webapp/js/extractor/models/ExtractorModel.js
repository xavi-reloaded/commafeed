/**
 * Created by jonny on 01/09/13.
 */
var ExtractorModel = (function () {

    function ExtractorModel(analyserService, HtmlCleanerService) {
        this.analyzerService = analyserService;
        this.htmlCleanerService = HtmlCleanerService;
        this.id = "ANGULAR_APP";
        this.name = "basic-user";
    }
    ExtractorModel.prototype.getAnalysis = function(data,afterAnalyzing){
        this.analyzerService.getAnalysis({l: data.language, id: this.id, name: this.name, w: data.phrase}, function(res){
            afterAnalyzing(res);
        });
    };
    ExtractorModel.prototype.getHtmlText = function(phrase, afterWGetClean){
        this.htmlCleanerService.getHtmlText({id: this.id, name: this.name, u: phrase}, function(res){
            afterWGetClean(res);
        });
    };
    return ExtractorModel;
})();
if (typeof(module) == 'undefined');
else {
    module.exports = ExtractorModel;
}