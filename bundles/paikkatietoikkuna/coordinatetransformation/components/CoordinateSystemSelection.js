Oskari.clazz.define('Oskari.coordinatetransformation.component.CoordinateSystemSelection',
    function (view, loc, type, helper) {
        this.view = view;
        this.loc = loc;
        this.helper = helper;
        this.type = type;
        this.element = null;
        this.epsgInput = null;
        this.select = Oskari.clazz.create('Oskari.coordinatetransformation.component.select', view);
        this.systemInfo = Oskari.clazz.create('Oskari.coordinatetransformation.view.CoordinateSystemInformation');
        this.selectInstances = {};
        this.dropdowns = {};
        this.replacedEpsg = null;
        this.isAxisFlip = false;
        this._template = {
            systemWrapper: jQuery('<div class="coordinate-system-wrapper"></div>'),
            coordinateSystemSelection: obj =>
                `<h4>${obj.title}</h4>
                <div class="transformation-system">
                    <div class="system epsgSearch selection-wrapper">
                        <b class="dropdown_title">${obj.epsg_search}</b>
                        <input type="text" placeholder="3067"/>
                        <div class="infolink icon-info" data-system="epsgSearch" title="${obj.tooltip.epsgSearch}"></div>
                    </div>
                    <div class="system datum selection-wrapper system-filter">
                        <b class="dropdown_title"> ${obj.geodetic_datum}</b>
                        <div class="selectMountPoint"></div>
                        <div class="infolink icon-info" data-system="geodeticDatum" title="${obj.tooltip.geodeticDatum}"></div>
                    </div>
                    <div class="system coordinate selection-wrapper system-filter">
                        <b class="dropdown_title"> ${obj.coordinate_system}</b>
                        <div class="selectMountPoint"></div>
                        <div class="infolink icon-info" data-system="coordinateSystem" title="${obj.tooltip.coordinateSystem}"></div>
                    </div>
                    <div class="system projection selection-wrapper system-filter">
                        <b class="dropdown_title"> ${obj.map_projection}</b>
                        <div class="selectMountPoint"></div>
                        <div class="infolink icon-info" data-system="mapProjection" title="${obj.tooltip.mapProjection}"></div>
                    </div>
                    <div class="system geodetic-coordinate selection-wrapper">
                        <b class="dropdown_title"> ${obj.geodetic_coordinate_system} *</b>
                        <div class="selectMountPoint"></div>
                        <div class="infolink icon-info" data-system="geodeticCoordinateSystem" title="${obj.tooltip.geodeticCoordinateSystem}"></div>
                    </div>
                    <div class="system elevation selection-wrapper">
                        <b class="dropdown_title"> ${obj.elevation_system} </b>
                        <div class="selectMountPoint"></div>
                        <div class="infolink icon-info" data-system="heightSystem" title="${obj.tooltip.heightSystem}"></div>
                    </div>
                </div>`
        };
        this.createUi();
        Oskari.makeObservable(this);
    }, {
        getName: function () {
            return 'Oskari.coordinatetransformation.component.CoordinateSystemSelection';
        },
        setElement: function (el) {
            this.element = el;
        },
        getElement: function () {
            return this.element;
        },
        createUi: function () {
            const me = this;
            const wrapper = this._template.systemWrapper.clone();
            let title;
            wrapper.addClass(this.type);
            if (this.type === 'input') {
                title = this.loc('flyout.coordinateSystem.input.title');
            } else {
                title = this.loc('flyout.coordinateSystem.output.title');
            }

            const coordinateSystemSelection = this._template.coordinateSystemSelection({
                title: title,
                epsg_search: this.loc('flyout.coordinateSystem.epsgSearch.label'),
                geodetic_datum: this.loc('flyout.coordinateSystem.geodeticDatum.label'),
                coordinate_system: this.loc('flyout.coordinateSystem.coordinateSystem.label'),
                map_projection: this.loc('flyout.coordinateSystem.mapProjection.label'),
                geodetic_coordinate_system: this.loc('flyout.coordinateSystem.geodeticCoordinateSystem.label'),
                elevation_system: this.loc('flyout.coordinateSystem.heightSystem.label'),
                tooltip: this.getTooltips()
            });
            wrapper.append(coordinateSystemSelection);
            this.setElement(wrapper);

            const json = this.helper.getOptionsJSON();
            Object.keys(json).forEach(function (key) {
                const selector = '.' + key;
                const container = jQuery(wrapper.find(selector)).find('.selectMountPoint');
                me.createDropdown(container, json[key], key);
            });
            // hide projection select
            this.showProjectionSelect(false);
            this.bindEpsgSearch();
            this.showEpsgSearch(false);
            this.handleInfoLinks();
        },
        createDropdown: function (container, json, dropdownId) {
            const me = this;
            const select = Oskari.clazz.create('Oskari.userinterface.component.SelectList', dropdownId);
            const options = {
                placeholder_text: json.DEFAULT.title,
                allow_single_deselect: true,
                disable_search_threshold: 50,
                width: '100%'
            };
            const selections = [];
            Object.keys(json).forEach(function (key) {
                // don't add default/placeholder option
                if (key === 'DEFAULT') {
                    return;
                }
                const obj = json[key];
                const valObj = {
                    id: key,
                    title: obj.title,
                    cls: obj.cls
                };
                if (dropdownId === 'geodetic-coordinate') {
                    valObj.tooltip = key;
                }
                selections.push(valObj);
            });
            const dropdown = select.create(selections, options);
            dropdown.css({
                width: '180px' // TODO to css
            });
            select.adjustChosen();

            dropdown.on('change', function (event) {
                me.handleSelectValueChange(select);
            });
            container.append(dropdown);
            this.dropdowns[dropdownId] = dropdown;
            this.selectInstances[dropdownId] = select;
        },

        /**
         * @method createAndHandleSelect
         * @desc creates an instance of the { Oskari.coordinatetransformation.component.select },
         * and fills it with data
         *
        createAndHandleSelect: function () {
            var me = this;
            var wrapper = this.getElement();
            this.select.create();
            this.selectInstance = this.select.getSelectInstances();
            this.dropdowns = this.select.getDropdowns();
            Object.keys( this.dropdowns ).forEach( function( key ) {
                var system = jQuery( wrapper.find( '.transformation-system' ).find( me.makeClassSelector(key) ).find('.selectMountPoint').append( me.dropdowns[key] ));
                system.parent().on('change', { 'self': me }, function ( e ) {
                    var self = e.data.self;
                    var currentValue = self.selectInstance[e.currentTarget.dataset.system].getValue();
                    self.handleSelectValueChange(currentValue);
                });
            });
        }, */
        // TODO
        handleInfoLinks: function () {
            const me = this;
            this.getElement().find('.infolink').on('click', function (event) {
                event.stopPropagation();
                const key = this.dataset.system;
                me.systemInfo.show(jQuery(this), key);
            });
        },
        bindEpsgSearch: function () {
            const me = this;
            const inputElem = this.getElement().find('.epsgSearch input');
            inputElem.on('input', function (evt) {
                me.searchEpsg(inputElem, evt.target.value);
            });
            inputElem.on('focus', function (evt) {
                inputElem.select();
            });
            this.epsgInput = inputElem;
        },
        setEpsgInputValue: function (val) {
            if (typeof val === 'string' && val.indexOf('EPSG:') === 0) {
                this.epsgInput.val(val.substring(5));
            } else {
                this.epsgInput.val('');
            }
        },
        searchEpsg: function (inputElem, value) {
            let epsgValues;
            if (value.length === 4 || value.length === 5) {
                epsgValues = this.helper.findEpsg(value);
                if (epsgValues) {
                    this.selectInstances['geodetic-coordinate'].setValue(epsgValues.srs);
                    inputElem.css('color', '#444');
                    // compound epsg contains heightSrs
                    if (epsgValues.heightSrs) {
                        this.selectInstances.elevation.setValue(epsgValues.heightSrs);
                    } else {
                        this.disableElevationSelection(false);
                        // "normal" epsg doesn't contain height system -> reset height system ??
                        // this.selectInstances.elevation.setValue('');
                    }
                    this.isAxisFlip = epsgValues.isAxisFlip === true;
                    this.replacedEpsg = epsgValues.replaced || null;
                    this.trigger('CoordSystemChanged', this.type);
                } else {
                    inputElem.css('color', '#F00');
                }
            } else {
                inputElem.css('color', '#999');
            }
        },
        getTooltips: function () {
            return {
                geodeticDatum: this.loc('infoPopup.geodeticDatum.info'),
                coordinateSystem: this.loc('infoPopup.coordinateSystem.info'),
                mapProjection: this.loc('infoPopup.mapProjection.info'),
                geodeticCoordinateSystem: this.loc('infoPopup.geodeticCoordinateSystem.info'),
                heightSystem: this.loc('infoPopup.heightSystem.info'),
                epsgSearch: this.loc('infoPopup.epsgSearch.info')
            };
        },
        toggleFilter: function (filter, fromMap) {
            if (fromMap !== true) {
                this.resetFilters();
            }
            if (filter === 'epsg') {
                this.showSystemFilters(false);
                this.showEpsgSearch(true);
                this.showProjectionSelect(false, fromMap);
            } else if (filter === 'systems') {
                this.showEpsgSearch(false);
                this.showSystemFilters(true);
                this.showProjectionSelect(fromMap);
            }
        },
        showEpsgSearch: function (display) {
            const epsgSearch = this.getElement().find('.epsgSearch');
            if (display) {
                epsgSearch.css('display', '');
            } else {
                epsgSearch.css('display', 'none');
                epsgSearch.find('input').val('');
            }
        },
        showSystemFilters: function (display) {
            const filterElems = this.getElement().find('.system-filter');
            if (display) {
                filterElems.css('display', '');
            } else {
                filterElems.css('display', 'none');
            }
        },
        /**
         * @method updateDropdownOptions
         * @param {string} valueClass - class selector to show options for
         * @param {string} keyToEmpty - optional param to empty only one specific key in the dropdown
         */
        updateDropdownOptions: function (dropdownId, selector) {
            let options;
            if (typeof selector === 'string' && selector !== '') {
                this.dropdowns[dropdownId].find('option').css('display', 'none');
                options = this.dropdowns[dropdownId].find(selector);
                options.css('display', '');
                if (dropdownId === 'geodetic-coordinate' && options.length === 1) {
                    this.selectInstances['geodetic-coordinate'].setValue(options.val());
                    this.setEpsgInputValue(options.val());
                    this.trigger('CoordSystemChanged', this.type);
                }
            } else {
                this.dropdowns[dropdownId].find('option').css('display', '');
            }
        },

        /**
         * @method handleSelectValueChange
         * @param {SelectList} select - dropdown we changed
         * @desc handle hiding and showing dropdown options based on user selection
         */
        handleSelectValueChange: function (select) {
            const currentValue = select.getValue();
            const selectId = select.getId();
            let disableElevSystem = false;
            switch (selectId) {
            case 'datum':
                this.resetAndUpdateSelects();
                break;
            case 'coordinate':
                if (currentValue === 'COORD_PROJ_2D') {
                    this.showProjectionSelect(true);
                } else {
                    this.showProjectionSelect(false);
                }
                if (currentValue === 'COORD_GEOG_3D' || currentValue === 'COORD_PROJ_3D') {
                    disableElevSystem = true;
                }
                this.resetAndUpdateCoordSelect();
                break;
            case 'projection':
                this.resetAndUpdateCoordSelect();
                break;
            case 'elevation':
                // Show info popup if N43 is selected
                if (currentValue === 'N43') {
                    this.showN43Info();
                }
                break;
            case 'geodetic-coordinate':
                this.setEpsgInputValue(currentValue);
                break;
            default:
                Oskari.log(this.getName()).warn('Invalid select');
                return;
            }
            // replaced epsg can't be selected from dropdown, only from epsg search
            if (selectId !== 'elevation') {
                this.replacedEpsg = null;
                this.isAxisFlip = false;
            }
            this.disableElevationSelection(disableElevSystem);
            this.trigger('CoordSystemChanged', this.type);
        },
        disableElevationSelection: function (disable) {
            const select = this.selectInstances.elevation;
            if (disable === true) {
                // TODO
                // select.resetSelectToPlaceholder();
                select.setValue('');
                select.setEnabled(false, true);
            } else {
                select.setEnabled(true, true);
            }
        },
        showN43Info: function () {
            const { info, url = '' } = this.loc('flyout.coordinateSystem.heightSystem.n43');
            const link = `<a href=${url} target="_blank">${url}</a>`;
            const content = info + ' ' + link + '.';
            this.helper.showPopup(this.loc('flyout.coordinateSystem.heightSystem.label'), content);
        },
        disableAllSelections: function (disable) {
            const selects = this.selectInstances;
            const epsgSearch = this.epsgInput;
            if (disable === true) {
                Object.keys(selects).forEach(function (key) {
                    selects[key].setEnabled(false, true);
                });
                epsgSearch.prop('disabled', true);
            } else {
                Object.keys(selects).forEach(function (key) {
                    selects[key].setEnabled(true, true);
                });
                epsgSearch.prop('disabled', false);
            }
        },
        isGeodeticSystemSelected: function () {
            if (this.selectInstances['geodetic-coordinate'].getValue() !== '') {
                return true;
            }
            return false;
        },
        isHeightSystemSelected: function () {
            if (this.selectInstances.elevation.getValue() !== '') {
                return true;
            }
            return false;
        },
        isMapProjectionSelected: function () {
            const mapEpsg = this.helper.getMapEpsgValues();
            const srs = this.selectInstances['geodetic-coordinate'].getValue();
            if (srs === mapEpsg.srs) {
                return true;
            }
            return false;
        },
        selectMapProjection: function (showProjection) {
            const srsOptions = this.helper.getMapEpsgValues();
            const selects = this.selectInstances;
            if (srsOptions) {
                selects.datum.setValue(srsOptions.datum);
                selects.coordinate.setValue(srsOptions.coord);
                if (srsOptions.coord === 'COORD_PROJ_2D') {
                    selects.projection.setValue(srsOptions.proj);
                    this.showProjectionSelect(showProjection, true);
                }
                selects['geodetic-coordinate'].setValue(srsOptions.srs);
                // TODO
                // selects.elevation.resetSelectToPlaceholder();
                selects.elevation.setValue('');
            }
            this.updateAllDropdowns();
            this.trigger('CoordSystemChanged', this.type);
        },
        showProjectionSelect: function (display, preventReset) {
            const elem = jQuery(this.getElement()).find('.projection');
            if (display === true) {
                elem.css('display', '');
            } else {
                elem.css('display', 'none');
                // TODO
                // this.selectInstances.projection.resetSelectToPlaceholder();
                if (preventReset !== true) {
                    this.selectInstances.projection.setValue('');
                }
            }
        },
        getSelections: function () {
            const selects = this.selectInstances;
            const selections = {
                isAxisFlip: this.isAxisFlip,
                replacedEpsg: this.replacedEpsg
            };
            Object.keys(selects).forEach(function (key) {
                selections[key] = selects[key].getValue();
            });
            return selections;
        },
        getSrs: function () {
            return this.selectInstances['geodetic-coordinate'].getValue();
        },
        getSrsForTransformation: function () {
            return this.replacedEpsg || this.getSrs();
        },
        getElevation: function () {
            return this.selectInstances.elevation.getValue();
        },
        getIsAxisFlip: function () {
            return this.isAxisFlip;
        },
        resetAllSelections: function () {
            this.disableElevationSelection(false);
            this.resetAndUpdateSelects(true);
            this.trigger('CoordSystemChanged', this.type);
        },
        resetFilters: function () {
            this.resetAndUpdateSelects(true, true);
        },
        resetAndUpdateSelects: function (resetDatum, skipCoordSys) {
            const selects = this.selectInstances;
            Object.keys(selects).forEach(function (key) {
                if (key === 'datum' && resetDatum !== true) {
                    return;
                }
                if (skipCoordSys === true && (key === 'geodetic-coordinate' || key === 'elevation')) {
                    return;
                }
                // TODO
                // selects[key].resetToPlaceholder();
                selects[key].setValue('');
            });
            if (skipCoordSys !== true) {
                this.setEpsgInputValue();
            }
            this.showProjectionSelect(false);
            this.updateAllDropdowns();
        },
        updateAllDropdowns: function () {
            const coordSelector = this.makeClassSelectorFromSelections();
            const datumSelector = this.makeClassSelectorFromDatum();
            // Filter dropdowns with clsSelector if selector is "" then show all options
            this.updateDropdownOptions('geodetic-coordinate', coordSelector);
            this.updateDropdownOptions('projection', datumSelector);
            this.updateDropdownOptions('coordinate', datumSelector);
            // update chosen-results manually because dropdown's selections are handled after change by css
            this.getElement().find('select').trigger('chosen:updated');
        },
        resetAndUpdateCoordSelect: function () {
            const clsSelector = this.makeClassSelectorFromSelections();
            const select = this.selectInstances['geodetic-coordinate'];
            // TODO
            // select.resetToPlaceholder();
            select.setValue('');
            this.updateDropdownOptions('geodetic-coordinate', clsSelector);
            // update chosen-results manually because dropdown's selections are handled after change by css
            this.getElement().find('.geodetic-coordinate select').trigger('chosen:updated');
        },
        makeClassSelector: function (variable) {
            if (variable === '') {
                return '';
            }
            return '.' + variable;
        },
        makeClassSelectorFromDatum: function () {
            const datum = this.selectInstances.datum.getValue();
            return this.makeClassSelector(datum);
        },
        makeClassSelectorFromSelections: function () {
            const selects = this.getSelections();
            return this.makeClassSelector(selects.coordinate) +
                this.makeClassSelector(selects.projection) +
                this.makeClassSelector(selects.datum);
        },
        updateSelectValues: function () {
            const selects = this.selectInstances;
            Object.keys(selects).forEach(function (key) {
                selects[key].update();
            });
        },
        getSelectInstances: function () {
            return this.selectInstances;
        }
    }
);
