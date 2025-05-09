Oskari.clazz.define('Oskari.coordinatetransformation.view.transformation',
    function (instance, helper, dataHandler) {
        const me = this;
        me.instance = instance;
        me.loc = Oskari.getMsg.bind(null, 'coordinatetransformation');
        me.conversionContainer = null;
        // me.sourceSelection = null; //TODO move
        me.helper = helper;
        me.dataHandler = dataHandler;
        me.messageDialog = null;
        // TODO remove fileInput here if is ok to move it to importfilehandler
        /* me.fileInput = Oskari.clazz.create('Oskari.userinterface.component.FileInput', {
            'allowMultipleFiles': false,
            'maxFileSize': 50,
            'allowedFileTypes': ["text/plain"]
        }); */
        me.importFileHandler = Oskari.clazz.create('Oskari.coordinatetransformation.view.FileHandler', me.helper, me.loc, 'import');
        me.exportFileHandler = Oskari.clazz.create('Oskari.coordinatetransformation.view.FileHandler', me.helper, me.loc, 'export');

        me.inputTable = Oskari.clazz.create('Oskari.coordinatetransformation.component.CoordinateTable', this, me.loc, 'input');
        me.outputTable = Oskari.clazz.create('Oskari.coordinatetransformation.component.CoordinateTable', this, me.loc, 'output');
        me.bindTableHoverListeners();
        me.inputSystem = Oskari.clazz.create('Oskari.coordinatetransformation.component.CoordinateSystemSelection', this, me.loc, 'input', me.helper);
        me.outputSystem = Oskari.clazz.create('Oskari.coordinatetransformation.component.CoordinateSystemSelection', this, me.loc, 'output', me.helper);

        me.sourceSelect = Oskari.clazz.create('Oskari.coordinatetransformation.component.SourceSelect', me.loc);
        me.spinner = Oskari.clazz.create('Oskari.userinterface.component.ProgressSpinner');
        me.importFileHandler.create();
        me.exportFileHandler.create();
        me.filter = 'systems';
        // TODO move to bind listeners
        me.inputSystem.on('CoordSystemChanged', function (type) {
            me.onSystemSelectionChange(type);
        });
        me.outputSystem.on('CoordSystemChanged', function (type) {
            me.onSystemSelectionChange(type);
        });
        me.sourceSelect.on('SourceSelectChange', function (value) {
            if (me.dataHandler.hasInputCoords()) {
                // TODO: with map selection overrides user selections, so do we have to confirm that also.
                // Now doesn't clear selections because source selection is after crs selections in ui
                me.showConfirm(me.loc('dataSource.title'), me.loc('dataSource.confirmChange'), me.changeSourceAndResetCoords.bind(me, value));
                return;
            } else if (value === 'map') {
                if ((me.inputSystem.isGeodeticSystemSelected() && !me.inputSystem.isMapProjectionSelected()) || me.inputSystem.isHeightSystemSelected()) {
                    me.showConfirm(me.loc('dataSource.title'), me.loc('dataSource.map.confirmSelect'), me.handleSourceSelection.bind(me, value));
                    return;
                }
            }
            me.handleSourceSelection(value);
        });
        me.sourceSelect.on('SourceSelectClick', function (value) {
            me.handleSourceClick(value);
        });
        me._template = {
            wrapper: jQuery('<div class="transformation-wrapper"></div>'), // TODO flyout container
            systems: jQuery('<div class="coordinate-systems-wrapper"></div>'),
            tables: jQuery('<div class="coordinate-tables-wrapper"></div>'),
            divider: jQuery('<div class="auto-margin-divider"></div>'),
            // title: template('<h4 class="header"><%= title %></h4>'), //TODO move
            // TODO oskari btn
            transformButton: ({ convert }) =>
                `<div class="transformation-button">
                    <input class="primary transform" type="button" value="${convert}"/>
                </div>`,
            // TODO oskari btn
            utilRow: ({ clear, show, fileexport }) =>
                `<div class="util-row-wrapper">
                    <input class="clear" type="button" value="${clear}"/>
                    <input class="show" type="button" value="${show}"/>
                    <input class="export primary" type="button" value="${fileexport}"/>
                </div>`,
            filterSystems: ({ title, systems, systemsInfo, epsg, epsgInfo }) =>
                `<div class="systems-filter-wrapper">
                    <h4>${title}</h4>
                    <div class="coordinate-systems-filters">
                        <div class="source-select">
                            <input type="radio" id="filter-systems" name="filter-select" value="systems" checked />
                            <label for="filter-systems">
                                <span></span>
                                ${systems}
                            </label>
                        </div>
                        <div class="source-select">
                            <input type="radio" id="filter-epsg" name="filter-select" value="epsg"/>
                            <label for="filter-epsg">
                                <span></span>
                                ${epsg}
                            </label>
                        </div>
                    </div>
                </div>`
        };
    }, {
        getName: function () {
            return 'Oskari.coordinatetransformation.view.transformation';
        },
        getContainer: function () {
            return jQuery(this.conversionContainer);
        },
        createUI: function (container) {
            this.conversionContainer = container;

            // var inputTitle = this._template.title( { title: this.loc('flyout.coordinateSystem.input') } ); //TODO move
            // var resultTitle = this._template.title( { title: this.loc('flyout.coordinateSystem.output') } ); //TODO move

            const inputTable = this.inputTable.create();
            const targetTable = this.outputTable.create();

            const transformButton = this._template.transformButton({ convert: this.loc('actions.convert') });

            const utilRow = this._template.utilRow({
                clear: this.loc('flyout.coordinateTable.clearTables'),
                show: this.loc('mapMarkers.show.title'),
                fileexport: this.loc('actions.export')
            });

            const wrapper = this._template.wrapper.clone();

            const sourceFilter = this._template.filterSystems({
                title: this.loc('flyout.filterSystems.title'),
                systems: this.loc('flyout.filterSystems.systems'),
                systemsInfo: this.loc('flyout.filterSystems.systemsInfo'),
                epsg: this.loc('flyout.filterSystems.epsg'),
                epsgInfo: this.loc('flyout.filterSystems.epsgInfo')
            });
            wrapper.append(sourceFilter);
            const systems = this._template.systems.clone();
            if (this.inputSystem.getElement()) { // TODO move
                // var element = this.inputSystem.getElement();
                // element.attr('data-type', 'coordinate-input');
                // element.prepend( inputTitle );
                systems.append(this.inputSystem.getElement());
            }
            systems.append(this._template.divider.clone());
            if (this.outputSystem.getElement()) { // TODO move
                // var element = this.outputSystem.getElement();
                // element.attr('data-type', 'coordinate-output');
                // element.prepend( resultTitle );
                systems.append(this.outputSystem.getElement());
            }
            wrapper.append(systems);

            if (this.sourceSelect.getElement()) {
                wrapper.append(this.sourceSelect.getElement());
            }

            // this.fileInput.setVisible(false);
            // wrapper.find( '.datasource-info' ).append( this.fileInput.getElement() );
            const tables = this._template.tables.clone();
            tables.append(inputTable);
            tables.append(transformButton);
            tables.append(targetTable);
            wrapper.append(tables);
            wrapper.append(utilRow);

            jQuery(container).append(wrapper);

            this.handleButtons();
            // this.handleRadioButtons();
            // preselect radio button here beceause event listeners are not ready
            this.handleSourceSelection(this.sourceSelect.sources[0]);
            this.bindFilterRadioButtons();
            this.bindTableScroll();
        },
        bindTableHoverListeners: function () {
            const me = this;
            this.inputTable.on('HighlightTableRow', function (data) {
                me.inputTable.highlightRow(data);
                me.outputTable.highlightRow(data);
            });
            this.outputTable.on('HighlightTableRow', function (data) {
                me.inputTable.highlightRow(data);
                me.outputTable.highlightRow(data);
            });
        },
        bindFilterRadioButtons: function () {
            const me = this;
            const container = this.getContainer();
            container.find('input[type=radio][name=filter-select]').on('change', function (evt) {
                me.filter = this.value;
                me.inputSystem.toggleFilter(me.filter, me.sourceSelect.getSourceSelection() === 'map');
                me.outputSystem.toggleFilter(me.filter);
            });
        },
        bindTableScroll: function () {
            const me = this;
            this.inputTable.on('TableScroll', function (px) {
                me.outputTable.scrollTable(px);
            });
            this.outputTable.on('TableScroll', function (px) {
                me.inputTable.scrollTable(px);
            });
        },
        setVisible: function (visible) {
            if (!visible) {
                Oskari.getSandbox().postRequestByName('userinterface.UpdateExtensionRequest', [this.instance, 'hide']);
            } else {
                Oskari.getSandbox().postRequestByName('userinterface.UpdateExtensionRequest', [this.instance, 'attach']);
            }
        },
        closePopups: function () {
            this.importFileHandler.closeFileDialogue();
            this.exportFileHandler.closeFileDialogue();
            this.inputSystem.systemInfo.close();
            this.outputSystem.systemInfo.close();
        },
        // TODO do we need this??
        getTable: function (type) {
            if (type === 'input') {
                return this.inputTable;
            } else if (type === 'output') {
                return this.outputTable;
            }
        },

        // TODO do we need this??
        getSelectionValue: function (selectListInstance) {
            return selectListInstance.getValue();
        },
        // TODO do we need this??
        setSelectionValue: function (selectInstance, value) {
            selectInstance.setValue(value);
        },
        getCrsOptions: function () {
            const input = this.inputSystem;
            const target = this.outputSystem;
            const dimensions = this.instance.getDimensions();

            return {
                sourceCrs: input.getSrsForTransformation(),
                sourceElevationCrs: input.getElevation(),
                targetCrs: target.getSrsForTransformation(),
                targetElevationCrs: target.getElevation(),
                sourceDimension: dimensions.input,
                targetDimension: dimensions.output
            };
        },
        showMessage: function (title, message) {
            if (this.messageDialog) {
                this.messageDialog.close();
                this.messageDialog = null;
            }
            const dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            const btn = dialog.createCloseButton(this.loc('actions.close'));
            dialog.show(title, message, [btn]);
            dialog.fadeout(5000);
            this.messageDialog = dialog;
        },
        showConfirm: function (title, message, confirmedCb) {
            const dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            const okBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
            const cancelBtn = dialog.createCloseButton(this.loc('actions.cancel'));
            okBtn.setTitle(this.loc('actions.ok'));
            okBtn.addClass('primary');
            okBtn.setHandler(function () {
                if (typeof confirmedCb === 'function') {
                    confirmedCb();
                }
                dialog.close();
            });
            dialog.show(title, message, [cancelBtn, okBtn]);
        },
        resetFlyout: function (value) {
            this.dataHandler.clearCoords();
            this.inputSystem.resetAllSelections();
            this.outputSystem.resetAllSelections();
            this.handleSourceSelection(this.sourceSelect.sources[0]);
        },
        changeSourceAndResetCoords: function (value) {
            this.dataHandler.clearCoords();
            this.handleSourceSelection(value);
        },
        onSystemSelectionChange: function (type) {
            let table,
                fileHandler,
                systemSelection;
            if (type === 'input') {
                systemSelection = this.inputSystem;
                table = this.inputTable;
                fileHandler = this.importFileHandler;
            } else {
                systemSelection = this.outputSystem;
                table = this.outputTable;
                fileHandler = this.exportFileHandler;
            }
            const selections = systemSelection.getSelections();
            const srs = selections['geodetic-coordinate'];
            const heightSystem = selections.elevation;
            this.instance.setDimension(type, srs, heightSystem);
            const epsgValues = this.helper.getEpsgValues(srs);
            if (epsgValues) {
                table.updateHeader(epsgValues, heightSystem, selections.isAxisFlip);
                if (this.helper.isGeogSystem(srs)) {
                    fileHandler.setIsMetricSystem(false);
                } else {
                    systemSelection.disableElevationSelection(false);
                    fileHandler.setIsMetricSystem(true);
                }
                if (this.helper.is3DSystem(srs)) {
                    systemSelection.disableElevationSelection(true);
                } else {
                    systemSelection.disableElevationSelection(false);
                }
                // updating table input coordinates is binded on table's content focusout
                // which calls inputTableHandler
                // TODO when handling is moved to table then clean this
                this.inputTable.getContainer().find('.oskari-table-content').trigger('focusout');
            } else {
                table.updateHeader(); // remove header
                fileHandler.setIsMetricSystem(false); // show degree systems options
            }
            const dimension = this.instance.getDimension(type);
            table.handleDisplayingElevationRows(dimension);
        },
        handleSourceSelection: function (value) {
            if (this.filter === 'epsg' && this.sourceSelect.getSourceSelection() === 'map') {
                this.inputSystem.resetFilters();
            }
            this.sourceSelect.selectSource(value);
            if (value === 'file') {
                this.inputTable.setIsEditable(false);
                this.importFileHandler.showFileDialogue(this.readFileToArray.bind(this));
                this.exportFileHandler.setIsFileInput(true);
                this.inputSystem.disableAllSelections(false);
                this.bindInputTableHandler(false);
            } else if (value === 'keyboard') {
                this.inputTable.setIsEditable(true);
                this.inputSystem.disableAllSelections(false);
                this.exportFileHandler.setIsFileInput(false);
                this.bindInputTableHandler(true);
            } else if (value === 'map') {
                this.inputTable.setIsEditable(false);
                this.selectFromMap();
                this.inputSystem.selectMapProjection(this.filter === 'systems');
                this.inputSystem.disableAllSelections(true);
                this.exportFileHandler.setIsFileInput(false);
                this.bindInputTableHandler(false);
            }
        },
        handleSourceClick: function (value) {
            if (value === 'file') {
                this.importFileHandler.showFileDialogue(this.readFileToArray.bind(this));
            } else if (value === 'map') {
                this.selectFromMap();
            }
        },
        // bind and unbind table input listener
        bindInputTableHandler: function (blnBind) {
            const me = this;
            const tableElem = me.inputTable.getContainer();

            if (blnBind === true) {
                jQuery(tableElem).find('.oskari-table-content').on('focusout', { meRef: me }, me.inputTableHandler); // tbody //focus, focusout,
            } else {
                jQuery(tableElem).find('.oskari-table-content').off('focusout', me.inputTableHandler);
            }
        },

        // TODO to table
        inputTableHandler: function (event) {
            const me = event.data.meRef;
            const dimension = me.instance.getDimension('input');
            const rows = jQuery(event.currentTarget).find('tr');
            const inputCoords = [];
            let addCoordinates = true;
            rows.each(function () {
                const cells = jQuery(this).find('.cellContent');
                const coord = [];
                let content;
                let cell;
                let emptyRow = true;
                for (let i = 0; i < dimension; i++) {
                    cell = jQuery(cells[i]);
                    content = cell.text();
                    if (content !== '') {
                        emptyRow = false;
                        content = parseFloat(content.replace(',', '.'));
                        if (isNaN(content)) {
                            cell.addClass('invalid-coord');
                            addCoordinates = false; // stop adding coordinates on first invalid coord to keep input and result table in sync
                        } else {
                            cell.text(content); // update cell content with parsed float
                            cell.removeClass('invalid-coord');
                            coord[i] = content;
                        }
                    } else {
                        cell.addClass('invalid-coord');
                        addCoordinates = false;
                    }
                }
                if (emptyRow) {
                    cells.removeClass('invalid-coord');
                    return false; // break at first empty row
                }
                if (addCoordinates) {
                    inputCoords.push(coord);
                    // Check that coord is in bounds
                    /*
                    if (me.helper.isCoordInBounds(srs, coord) === false){
                        me.showMessage("Error", "Coordinate: " + coord + " isn't inside bounds.");
                        return false;
                    }else{
                        inputCoords.push(coord);
                    } */
                }
            });
            // update input coordinates and don't render input table
            me.dataHandler.setInputCoords(inputCoords, true);
            me.inputTable.handleTableSize(inputCoords.length);
        },
        /**
         * @method handleButtons
         */
        handleButtons: function () {
            const me = this;
            const container = me.getContainer();
            let validCrsSelects;

            container.find('.selectFromMap').on('click', function () {
                me.selectFromMap();
            });

            container.find('.clear').on('click', function () {
                me.showConfirm(me.loc('flyout.coordinateTable.clearTables'), me.loc('flyout.coordinateTable.confirmClear'), me.dataHandler.clearCoords.bind(me.dataHandler));
            });
            container.find('.show').on('click', function () {
                me.showMarkersOnMap();
            });
            container.find('.export').on('click', function () {
                validCrsSelects = me.helper.validateCrsSelections(me.getCrsOptions());
                if (validCrsSelects === true) {
                    me.helper.checkDimensions(me.getCrsOptions(), me.handleExport.bind(me));
                }
            });
            container.find('.transform').on('click', function () {
                validCrsSelects = me.helper.validateCrsSelections(me.getCrsOptions());
                if (validCrsSelects === true) {
                    me.helper.checkDimensions(me.getCrsOptions(), me.transformToTable.bind(me));
                }
            });
        },
        selectFromMap: function () {
            this.instance.setMapSelectionMode(true);
            if (this.dataHandler.hasInputCoords()) {
                this.dataHandler.populateMapCoordsAndMarkers();
            }
            this.instance.toggleViews('MapSelection');
        },
        showMarkersOnMap: function () {
            const me = this;
            const source = this.sourceSelect.getSourceSelection();
            const srs = this.inputSystem.getSrs();
            const isAxisFlip = this.inputSystem.getIsAxisFlip();
            const transformCb = function (response) {
                me.showSpinner(false);
                let mapCoords;
                let inputCoords;
                // if response contains input coordinates then sync input table
                if (response.inputCoordinates && !me.dataHandler.hasInputCoords()) { // or check lengths
                    me.dataHandler.setInputCoords(response.inputCoordinates);
                }
                if (response.resultCoordinates) {
                    mapCoords = response.resultCoordinates;
                    inputCoords = me.dataHandler.getInputCoords();
                    me.helper.showMarkersOnMap(mapCoords, inputCoords, srs, isAxisFlip);
                    me.instance.toggleViews('mapmarkers');
                }
                if (response.hasMoreCoordinates === true) {
                    me.showMessage(this.loc('flyout.transform.responseFile.title'), this.loc('flyout.transform.responseFile.hasMoreCoordinates', { maxCoordsToArray: 100 }));
                }
            };
            if (srs === '') {
                this.helper.showPopup(this.loc('mapMarkers.show.title'), this.loc('mapMarkers.show.noSrs'));
                return;
            }
            if (source === 'file') {
                this.transformToMapCoords(transformCb);
            } else { // keyboard and map
                if (!this.dataHandler.hasInputCoords()) {
                    this.helper.showPopup(this.loc('mapMarkers.show.title'), this.loc('mapMarkers.show.noCoordinates'));
                    return;
                }
                if (srs === this.helper.mapSrs) {
                    this.helper.showMarkersOnMap(this.dataHandler.getInputCoords(), null, srs, isAxisFlip);
                    this.instance.toggleViews('mapmarkers');
                } else {
                    this.transformToMapCoords(transformCb);
                }
            }
        },
        handleExport: function () {
            this.exportFileHandler.showFileDialogue(this.transformToFile.bind(this));
        },
        readFileToArray: function (settings) {
            this.showSpinner(true);
            const crsSettings = this.getCrsOptions();
            // force to read file with dimension 3 if file is selected before crs selections
            if (crsSettings.sourceCrs === '') {
                crsSettings.sourceDimension = 3;
            }
            const fileSettings = settings;
            if (this.helper.validateFileSelections(fileSettings)) {
                this.dataHandler.clearCoords(); // reset tables
                this.instance.getService().readFileToArray(crsSettings, fileSettings, this.handleReadFileResponse.bind(this), this.handleErrorResponse.bind(this));
            }
        },
        transformToMapCoords: function (callback) {
            const crsSettings = {
                sourceCrs: this.inputSystem.getSrsForTransformation(),
                sourceElevationCrs: this.inputSystem.getElevation(),
                sourceDimension: this.instance.getDimensions().input,
                targetCrs: this.helper.mapSrs,
                targetDimension: 2
            };

            if (this.sourceSelect.getSourceSelection() === 'file') {
                const fileSettings = this.importFileHandler.getSettings();
                if (this.helper.validateFileSelections(fileSettings)) {
                    this.showSpinner(true);
                    this.instance.getService().transformFileToArray(crsSettings, fileSettings, callback, this.handleErrorResponse.bind(this));
                }
            } else {
                this.showSpinner(true);
                this.instance.getService().transformArrayToArray(this.dataHandler.getInputCoords(), crsSettings, callback, this.handleErrorResponse.bind(this));
            }
        },
        transformToTable: function () {
            const crsSettings = this.getCrsOptions();
            const source = this.sourceSelect.getSourceSelection();
            let coords;
            let fileSettings;
            if (source === 'file') {
                fileSettings = this.importFileHandler.getSettings();
                if (this.helper.validateFileSelections(fileSettings)) {
                    this.showSpinner(true);
                    this.instance.getService().transformFileToArray(crsSettings, fileSettings, this.handleArrayResponse.bind(this), this.handleErrorResponse.bind(this));
                }
            } else {
                if (this.dataHandler.hasInputCoords()) {
                    coords = this.dataHandler.getInputCoords();
                    this.showSpinner(true);
                    this.instance.getService().transformArrayToArray(coords, crsSettings, this.handleArrayResponse.bind(this), this.handleErrorResponse.bind(this));
                } else {
                    this.showMessage(this.loc('flyout.transform.validateErrors.title'), this.loc('flyout.transform.validateErrors.noInputData'));
                }
            }
        },
        transformToFile: function (settings) {
            const crsSettings = this.getCrsOptions();
            const exportSettings = settings;
            let coords;
            const source = this.sourceSelect.getSourceSelection();
            if (source === 'file') {
                const importSettings = this.importFileHandler.getSettings();
                if (this.helper.validateFileSelections(importSettings)) {
                    if (importSettings.file.size > 10 * 1024 * 1024) {
                        this.showMessage(this.loc('flyout.transform.warnings.title'), this.loc('flyout.transform.warnings.largeFile'));
                    }
                    this.showSpinner(true);
                    this.instance.getService().transformFileToFile(crsSettings, importSettings, exportSettings, this.handleFileResponse.bind(this), this.handleErrorResponse.bind(this));
                }
            } else {
                if (this.dataHandler.hasInputCoords()) {
                    coords = this.dataHandler.getInputCoords();
                    this.showSpinner(true);
                    this.instance.getService().transformArrayToFile(coords, crsSettings, exportSettings, this.handleFileResponse.bind(this), this.handleErrorResponse.bind(this));
                } else {
                    this.showMessage(this.loc('flyout.transform.validateErrors.title'), this.loc('flyout.transform.validateErrors.noInputData'));
                }
            }
        },
        handleReadFileResponse: function (response) {
            this.showSpinner(false);
            const inputCoords = response.inputCoordinates;
            const error = response.error;
            const hasMoreCoordinates = response.hasMoreCoordinates;
            if (inputCoords) {
                this.dataHandler.setInputCoords(inputCoords);
            }
            if (error) {
                this.handleErrorResponse(error, true);
            } else if (hasMoreCoordinates === true) {
                this.showMessage(this.loc('flyout.transform.responseFile.title'), this.loc('flyout.transform.responseFile.hasMoreCoordinates', { maxCoordsToArray: 100 }));
            }
        },
        handleArrayResponse: function (response) {
            this.showSpinner(false);
            const resultCoords = response.resultCoordinates;
            const inputCoords = response.inputCoordinates;
            const hasMoreCoordinates = response.hasMoreCoordinates;
            if (resultCoords) {
                this.dataHandler.setResultCoords(resultCoords);
            }
            if (inputCoords) {
                this.dataHandler.setInputCoords(inputCoords);
            }
            if (hasMoreCoordinates === true) {
                this.showMessage(this.loc('flyout.transform.responseFile.title'), this.loc('flyout.transform.responseFile.hasMoreCoordinates', { maxCoordsToArray: 100 }));
            }
        },
        handleFileResponse: function (data, filename, type) {
            this.showSpinner(false);
            this.helper.exportToFile(data, filename, type);
        },
        handleErrorResponse: function (errorInfo, isReadFile) {
            this.showSpinner(false);
            const title = isReadFile ? this.loc('flyout.transform.responseErrors.titleRead') : this.loc('flyout.transform.responseErrors.titleTransform');
            const errors = this.loc('flyout.transform.responseErrors');
            let errorMsg = errors.generic;
            let code;
            if (errorInfo && errorInfo.errorKey) {
                code = errorInfo.errorKey;
                if (code === 'invalid_coord_in_line') {
                    errorMsg = errors.transformFileError + '<br />' + Oskari.getMsg('coordinatetransformation', 'flyout.transform.responseErrors.invalidLine', { line: errorInfo.line, index: errorInfo.lineIndex });
                } else if (code === 'invalid_read_line') {
                    errorMsg = errors.readFileError + '<br />' + Oskari.getMsg('coordinatetransformation', 'flyout.transform.responseErrors.invalidLine', { line: errorInfo.line, index: errorInfo.lineIndex });
                } else if (code === 'transformation_error') { // error message from transformation service
                    errorMsg = errors[code] + '<br />' + errorInfo.exception;
                } else if (errors[code]) {
                    errorMsg = errors[code];
                }
            }
            this.showMessage(title, errorMsg);
        },
        showSpinner: function (bln) {
            const container = this.getContainer();
            const buttons = container.find('input[type=button]');
            if (bln) {
                buttons.prop('disabled', true);
                this.spinner.insertTo(container);
                this.spinner.start();
                return;
            }
            buttons.prop('disabled', false);
            this.spinner.stop();
        }
    }
);
