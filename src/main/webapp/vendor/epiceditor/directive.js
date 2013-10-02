// thanks to:
// https://groups.google.com/forum/?fromgroups#!searchin/angular/directive$20model/angular/odcpnPa0R2k/r48ov-D2YFgJ
// https://groups.google.com/forum/?fromgroups#!searchin/angular/scope$20ngmodel/angular/WDEsUD5eYck/TLv3XXmv-ZcJ

app.directive('uiEpicEditor', function() {
    return {
        require: 'ngModel',
        replace:true,
        template:'<div class="epic-editor"></div>',
        link: function(scope, element, attrs, ngModel) {
            
            var opts = {
                container: element.get(0), // raw element or ID
                basePath: 'lib/epiceditor/assets/', // from js file epiceditor.js
                file:{
                    autoSave:true
                },
                autoGrow: true,
                shortcut: {
                    modifier: 0,
                    fullscreen: 0,
                    preview: 0,
                    edit: 0
                },
                parser: keywordParser

                /*
                 localStorageName: 'epiceditor',
                 parser: marked,
                 basePath: 'epiceditor',
                file: {
                    name: 'epiceditor',
                    defaultContent: '',
                    autoSave: 100
                },
                theme: {
                    base:'/themes/base/epiceditor.css',
                    preview:'/themes/preview/preview-dark.css',
                    editor:'/themes/editor/epic-dark.css'
                },
                focusOnLoad: false,
                shortcut: {
                    modifier: 18,
                    fullscreen: 70,
                    preview: 80,
                    edit: 79
                }*/
            }
            
            
            
            var editor = new EpicEditor(opts);
            var iFrameEditor;
            editor.load(function () {
                // editor loaded
                
                // local -> parent scope change
                
                iFrameEditor = editor.getElement('editor');
               
                // we get body dom element, because this is contenteditable=true                
                // http://stackoverflow.com/questions/6256342/trigger-an-event-when-contenteditable-is-changed
                var contents = $('body',iFrameEditor).html();
                $('body',iFrameEditor).keyup(function() {
                    if (contents!=$(this).html()){
                        editor.save(); // important!
                        contents = $(this).html(); // set to new content
                        var rawContent = editor.exportFile();
                        ngModel.$setViewValue(rawContent);
                        scope.$apply();
                    }
                });
            });

            scope.$watch('mainText', function(newValue, oldValue) {
                if (newValue) {
                    $('body',iFrameEditor).html(newValue);
                }
            });
            scope.$watch('previewMode', function(newValue, oldValue) {
                if (newValue) {
                    editor.preview();
                } else {
                    editor.edit();
                }
            });



        }
    }
});