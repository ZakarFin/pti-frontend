Oskari.clazz.define('Oskari.coordinatetransformation.view.FileHandler',
    function (helper, loc, type) {
        const me = this;
        Oskari.makeObservable(this);
        me.helper = helper;
        me.loc = loc;
        me.element = null;
        me.type = type; // import, export
        me.infoPopup = Oskari.clazz.create('Oskari.coordinatetransformation.view.CoordinateSystemInformation');
        me.settings = {};
        me.metricSystem = false; // show degree systems options by default
        me.isFileInput = false;
        me.selections = {};
        /* eslint-disable indent */
        me._template = {
            settings: (obj) =>
                `<div class="coordinatetransformation-file-form">
                    ${obj.export
                        ? `<div class="selection-wrapper fileName without-infolink">
                            <b class="title">${obj.fileName}</b>
                            <input type="text">
                        </div>`
                        : `<div class="selection-wrapper fileInput without-infolink"></div>
                        <div class="selection-wrapper headerLineCount">
                            <b class="title">${obj.headerCount}</b>
                            <input type="number" value="0" min="0" required> 
                            <div class="infolink icon-info" data-selection="headerLineCount"></div>
                        </div>`
                    }
                    <div class="selection-wrapper unitFormat">
                        <b class="title">${obj.units.label}</b> 
                        <div class="settingsSelect">
                            <select>
                                <option value="degree" data-decimals="8">${obj.units.degree}</option>
                                <option value="gradian" data-decimals="8">${obj.units.gradian}</option>
                                <option value="radian" data-decimals="10">${obj.units.radian}</option>
                                <option value="DD" data-decimals="8">DD</option>
                                <option value="DD MM SS" data-decimals="4">DD MM SS</option>
                                <option value="DD MM" data-decimals="6">DD MM</option>
                                <option value="DDMMSS" data-decimals="4">DDMMSS</option>
                                <option value="DDMM" data-decimals="6">DDMM</option>
                            </select>
                        </div>
                        <div class="infolink icon-info" data-selection="unitFormat"></div>
                    </div>
                    ${!obj.export
                        ? ''
                        : `<div class="selection-wrapper decimalPrecision">
                            <b class="title">${obj.decimalPrecision}</b>
                            <div class="settingsSelect">
                            <select>
                                <option value="0">~1 m</option>
                                <option value="1">~0.1 m</option>
                                <option value="2">~1 cm</option>
                                <option value="3" selected>~1 mm</option>
                                <option value="4">~0.1 mm</option>
                            </select>
                        </div>
                            <div class="infolink icon-info" data-selection="decimalPrecision"></div>
                        </div>`
                    }
                    <div class="selection-wrapper decimalSeparator">
                        <b class="title">${obj.decimalSeparator}</b> 
                        <div class="settingsSelect">
                            <select>
                                <option value="" selected disabled>${obj.choose}</option>
                                <option value=".">${obj.delimeters.point}</option>
                                <option value=",">${obj.delimeters.comma}</option>
                            </select>
                        </div>
                        <div class="infolink icon-info" data-selection="decimalSeparator"></div>
                    </div>
                    <div class="selection-wrapper coordinateSeparator">
                        <b class="title">${obj.coordinateSeparator}</b> 
                        <div class="settingsSelect">
                            <select>
                                <option value="" selected disabled>${obj.choose}</option>
                                <option value="tab">${obj.delimeters.tab}</option>
                                <option value="space">${obj.delimeters.space}</option>
                                <option value="comma">${obj.delimeters.comma}</option>
                                <option value="semicolon">${obj.delimeters.semicolon}</option>
                            </select>
                        </div>
                        <div class="infolink icon-info" data-selection="coordinateSeparator"></div>
                    </div>
                    ${!obj.export
                        ? ''
                        : `<div class="selection-wrapper lineSeparator">
                            <b class="title">${obj.lineSeparator}</b> 
                            <div class="settingsSelect">
                                <select>
                                    <option value="win">Windows / DOS</option>
                                    <option value="unix">UNIX / Mac</option>
                                </select>
                            </div>
                            <div class="infolink icon-info" data-selection="lineSeparator"></div>
                        </div>`
                    }
                    <label class="lbl prefixId">
                        <input class="chkbox" type="checkbox">
                        <span></span>
                        <div class="infolink icon-info" data-selection="prefixId"></div>
                    </label>
                    <label class="lbl reverseCoordinates">
                        <input class="chkbox" type="checkbox">
                        <span>${obj.reverseCoords}</span>
                        <div class="infolink icon-info" data-selection="reverseCoordinates"></div>
                    </label> 
                    ${!obj.export
                        ? ''
                        : `<label class="lbl writeHeader">
                            <input class="chkbox" type="checkbox">
                            <span>${obj.writeHeader}</span>
                            <div class="infolink icon-info" data-selection="writeHeader"></div>
                        </label>
                        <label class="lbl lineEnds">
                            <input class="chkbox" type="checkbox">
                            <span>${obj.lineEnds}</span>
                            <div class="infolink icon-info" data-selection="lineEnds"></div>
                        </label>
                        <label class="lbl useCardinals">
                            <input class="chkbox" type="checkbox">
                            <span>${obj.useCardinals}</span>
                            <div class="infolink icon-info" data-selection="useCardinals"></div>
                        </label>`
                    }
                </div>
            </div`
        };
        /* eslint-enable indent */
    }, {
        getElement: function () {
            return this.element;
        },
        setElement: function (el) {
            this.element = el;
        },
        getName: function () {
            return 'Oskari.coordinatetransformation.view.FileHandler';
        },
        getSettings: function () {
            this.settings.selects = this.getFormSelections();
            // force unit to metric for non-degree systems
            if (this.metricSystem && this.settings.selects) {
                this.settings.selects.unit = 'metric';
            }
            // get decimal count
            this.settings.selects.decimalCount = this.helper.getDecimalCount(this.settings.selects.decimalPrecision, this.settings.selects.unit);
            delete this.settings.selects.decimalPrecision;
            return this.settings;
        },
        setIsMetricSystem: function (isMetric) {
            this.metricSystem = !!isMetric;
        },
        setIsFileInput: function (isFile) {
            this.isFileInput = isFile;
        },
        create: function () {
            const fileSettings = {
                export: false,
                fileName: this.loc('fileSettings.export.fileName'),
                options: this.loc('fileSettings.options'),
                decimalSeparator: this.loc('fileSettings.options.decimalSeparator'),
                coordinateSeparator: this.loc('fileSettings.options.coordinateSeparator'),
                reverseCoords: this.loc('fileSettings.options.reverseCoordinates'),
                headerCount: this.loc('fileSettings.options.headerCount'),
                decimalPrecision: this.loc('fileSettings.options.decimalPrecision'),
                units: this.loc('fileSettings.options.degreeFormat'),
                delimeters: this.loc('fileSettings.options.delimeters'),
                writeHeader: this.loc('fileSettings.options.writeHeader'),
                lineEnds: this.loc('fileSettings.options.lineEnds'),
                useCardinals: this.loc('fileSettings.options.useCardinals'),
                lineSeparator: this.loc('fileSettings.options.lineSeparator.label'),
                choose: this.loc('fileSettings.options.choose')
            };
            if (this.type === 'export') {
                fileSettings.export = true;
            }
            const element = jQuery(this._template.settings(fileSettings));
            if (this.type === 'import') {
                this.fileInput = Oskari.clazz.create('Oskari.userinterface.component.FileInput', {
                    allowMultipleFiles: false,
                    maxFileSize: 50,
                    allowedFileTypes: ['text/plain', 'text/csv'],
                    allowedFileExtensions: ['txt', 'csv'],
                    showNoFile: false
                });
                element.find('.fileInput').append(this.fileInput.getElement());
            }
            this.setElement(element);
            this.setTooltips();
        },
        /* createEventHandlers: function ( dialog ) {
            var me = this;
            jQuery( '.oskari-coordinate-form' ).on('click', '.done', function () {
                me.trigger('GetSettings', me.getFormSelections() );
                dialog.close();
            });

            jQuery( '.oskari-coordinate-form' ).on('click', '.cancel', function () {
                dialog.close();
            });
        }, */
        /**
         * @method getFormSelections
         */
        getFormSelections: function () {
            // var element = jQuery('.oskari-coordinate-form');
            const element = this.getElement();
            const settings = {
                fileName: element.find('.fileName input').val(),
                unit: element.find('.unitFormat option:checked').val(),
                decimalSeparator: element.find('.decimalSeparator option:checked').val(),
                coordinateSeparator: element.find('.coordinateSeparator option:checked').val(),
                prefixId: element.find('.prefixId input').is(':checked'),
                axisFlip: element.find('.reverseCoordinates input').is(':checked'),
                headerLineCount: element.find('.headerLineCount input').val(),
                lineSeparator: element.find('.lineSeparator option:checked').val(),
                decimalPrecision: element.find('.decimalPrecision option:checked').val(),
                writeHeader: element.find('.writeHeader input').is(':checked'),
                writeLineEndings: element.find('.lineEnds input').is(':checked'),
                writeCardinals: element.find('.useCardinals input').is(':checked')
            };
            return settings;
        },
        closeFileDialogue: function () {
            if (this.dialog) {
                this.dialog.close(true);
            }
            this.infoPopup.close();
        },
        showFileDialogue: function (callback) {
            if (this.dialog) {
                this.dialog.close(true);
                this.dialog = null;
            }
            const me = this;
            const elem = this.getElement();
            const formatRow = elem.find('.unitFormat');
            const dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            const title = this.type === 'import' ? this.loc('fileSettings.import.title') : this.loc('fileSettings.export.title');
            const btnText = this.type === 'import' ? this.loc('actions.done') : this.loc('actions.export');
            const cancelBtn = dialog.createCloseButton(this.loc('actions.cancel'));
            const btn = Oskari.clazz.create('Oskari.userinterface.component.Button');
            const useId = elem.find('.prefixId span');
            // var decimalInput = elem.find('.decimalCount input');
            btn.addClass('primary');
            btn.setTitle(btnText);
            btn.setHandler(function () {
                const settings = me.getSettings();
                if (me.type === 'import') {
                    settings.file = me.fileInput.getFiles();
                }
                me.settings.type = me.type;
                if (me.helper.validateFileSelections(settings) === false) {
                    return;
                }
                if (typeof callback === 'function') {
                    callback(settings);
                }
                dialog.close();
            });
            dialog.createCloseIcon();
            dialog.makeDraggable();
            if (this.metricSystem) {
                formatRow.css('display', 'none');
                // decimalInput.val(3);
            } else {
                formatRow.css('display', '');
                // decimalInput.val(8);
            }
            if (this.type === 'export') {
                const lineEnds = elem.find('.lineEnds');
                if (this.isFileInput) {
                    useId.text(this.loc('fileSettings.options.useId.add'));
                    lineEnds.css('display', '');
                } else {
                    useId.text(this.loc('fileSettings.options.useId.generate'));
                    lineEnds.css('display', 'none');
                }
            } else {
                useId.text(this.loc('fileSettings.options.useId.input'));
            }
            this.bindInfoLinks();
            /*
            // when degree unit is changed, change also default decimal value
            elem.find('.unitFormat select').on('change', function () {
                var decimals = jQuery(this).find(':checked').data('decimals');
                decimalInput.val(decimals);
            });
            */

            // HACK //
            // TODO handle listeners if fileinput is moved to file settings form instead of flyout
            if (this.type === 'import' && jQuery._data(this.fileInput.getElement().get(0), 'events') === undefined) {
                this.fileInput._bindAdvancedUpload();
            }
            dialog.show(title, elem, [cancelBtn, btn]);
            this.dialog = dialog;
            // this.createEventHandlers( dialog );
        },
        bindInfoLinks: function () {
            const me = this;
            this.getElement().find('.infolink').on('click', function (event) {
                event.preventDefault();
                const key = this.dataset.selection;
                me.infoPopup.show(jQuery(this), key, true);
            });
        },
        setTooltips: function () {
            const infoElems = this.getElement().find('.infolink');
            const infoLoc = this.loc('infoPopup');
            infoElems.each(function () {
                const key = this.dataset.selection;
                const tooltip = infoLoc[key].info;
                if (tooltip) {
                    jQuery(this).prop('title', tooltip);
                }
            });
        }/*,
        showInfoPopup: function(){
            var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            var btn = dialog.createCloseButton(this.loc('actions.ok'));
            btn.addClass('primary');
            btn.setHandler( function () {
                dialog.close(true);
            });
            dialog.show("title", "info", [btn]);
            dialog.moveTo(this);
            dialog.makeDraggable();

        }, */
        /*
        exportFile: function ( settings ) {
            var exportArray = this.dataHandler.getOutputCoords();
            //this.dataHandler.getCoordinateObject().forEach( function ( pair ) {
            //    exportArray.push( pair.input );
            //});
            if( exportArray.length !== 0 ) {
                this.fileInput.exportToFile( exportArray, settings.filename+'.txt' );
            } else {
                Oskari.log(this.getName()).warn("No transformed coordinates to write to file!");
            }
        } */
    }
);
