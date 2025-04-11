Oskari.clazz.define('Oskari.coordinatetransformation.component.SourceSelect',
    function (loc) {
        Oskari.makeObservable(this);
        this.loc = loc;
        this.element = null;
        this.sources = ['keyboard', 'file', 'map'];
        this.sourceElems = {};
        this.sourceSelection = null;
        this.systemInfo = Oskari.clazz.create('Oskari.coordinatetransformation.view.CoordinateSystemInformation');
        this._template = {
            // TODO remove unused sourceWrapper and source. also remove 2 from names and commented codes
            sourceWrapper: jQuery('<div class="datasource-wrapper"></div>'),
            source: ({ title, keyboard, keyboardInfo, file, fileInfo, map, mapInfo }) =>
                `<h4>${title}</h4>
                <div class="coordinate-datasources-wrapper">
                    <div class="source-select">
                        <input type="radio" id="clipboard" name="load" value="keyboard">
                        <label for="keyboard">
                            <span></span>
                            ${keyboard}
                        </label>
                        <div class="infolink icon-info" data-source="keyboard" title="${keyboardInfo}"></div>
                    </div>
                    <div class="source-select">
                        <input type="radio" id="file" name="load" value="file">
                        <label for="file">
                            <span></span>
                            ${file}
                        </label>
                        <div class="infolink icon-info" data-source="file" title="${fileInfo}"></div>
                    </div>
                    <div class="source-select">
                        <input type="radio" id="mapselection" name="load" value="map">
                        <label for="mapselection">
                            <span></span>
                            ${map}
                        </label>
                        <div class="infolink icon-info" data-source="map" title="${mapInfo}"></div>
                    </div>
                </div>`,
            sourceWrapper2: jQuery(
                '<div class="datasource-wrapper">' +
                    '<h4></h4>' +
                    '<div class="coordinate-datasources-wrapper"></div>' +
                // '<div class="datasource-actions-wrapper"></div>' +
                '</div>'
            ),
            source2: ({ type, label, action = '', tooltip }) =>
                `<div class="source-select-wrapper">
                    <div class="source-select">
                        <label>
                            <span></span>
                            ${label}
                        </label>
                        ${action &&
                            `<div class="action-link">
                                <div>&nbsp-&nbsp</div>
                                <a href="javascript:void(0);">${action}</a>
                            </div>`}
                    </div>
                    <div class="infolink icon-info" data-source="${type}" title="${tooltip}"></div>
                </div>`,
            actions: ({ mapButton, fileButton }) =>
                `<div class="datasource-action oskari-hidden">
                    <a href="javascript:void(0);">${mapButton}</a>
                </div>
                <div class="datasource-action oskari-hidden">
                    <a href="javascript:void(0);">${fileButton}</a>
                </div>`
        };
        this.createUi();
    }, {
        getName: function () {
            return 'Oskari.coordinatetransformation.components.SourceSelect';
        },
        setElement: function (el) {
            this.element = el;
        },
        getElement: function () {
            return this.element;
        },
        getSourceSelection: function () {
            return this.sourceSelection;
        },
        createUi: function () {
            if (this.element !== null) {
                return;
            }
            const me = this;
            const loc = this.loc('dataSource');
            const container = this._template.sourceWrapper2.clone();
            container.find('h4').text(loc.title);
            const sourceWrapper = container.find('.coordinate-datasources-wrapper');
            /* var source = this._template.source({
                title: this.loc('flyout.dataSource.title'),
                file: this.loc('flyout.dataSource.file.label'),
                keyboard: this.loc('flyout.dataSource.keyboard.label'),
                //choose: this.loc('flyout.dataSource.file.label'),
                map: this.loc('flyout.dataSource.map.label'),
                keyboardInfo:this.loc('flyout.dataSource.keyboard.info'),
                mapInfo: this.loc('flyout.dataSource.map.info'),
                fileInfo: this.loc('flyout.dataSource.file.info'),
                mapButton: this.loc('actions.selectFromMap'),
                fileButton: this.loc('actions.selectFromFile')
            });
            var info = this._template.info({
                keyboardupload: this.loc('flyout.dataSource.keyboard.info'),
                mapInfo: this.loc('flyout.dataSource.map.info'),
                mapButton: this.loc('actions.selectFromMap')
            }); */
            this.sources.forEach(function (source) {
                const elem = jQuery(me._template.source2({
                    type: source,
                    label: loc[source].label,
                    tooltip: loc[source].info,
                    action: loc[source].action
                }));
                const sourceSelect = elem.find('.source-select');
                me.bindClickHandler(sourceSelect, source);
                me.sourceElems[source] = sourceSelect;
                sourceWrapper.append(elem);
            });
            // wrapper.append(info);
            // wrapper.find('.selectFromMap').addClass('primary');
            // var actions = this._template.actions({
            //    fileButton: this.loc('dataSource.file.action'),
            //    mapButton: this.loc('dataSource.map.action')
            // });
            // sourceWrapper.append(actions);
            this.setElement(container);
            this.bindInfoLinks();
        },
        bindClickHandler: function (elem, value) {
            const me = this;
            elem.on('click', function () {
                // elem.find('input').trigger('click');
                if (me.sourceSelection !== value) {
                    /* elem.addClass('selected');
                    elem.find('.action').removeClass('oskari-hidden');
                    if (currentValue !== null){
                        me.sourceElems[currentValue].removeClass('selected');
                        me.sourceElems[currentValue].find('.action').addClass('oskari-hidden');
                    } */
                    me.trigger('SourceSelectChange', value);
                } else {
                    me.trigger('SourceSelectClick', me.sourceSelection);
                }
            });
        },
        bindInfoLinks: function () {
            const me = this;
            this.getElement().find('.infolink').on('click', function (event) {
                const key = this.dataset.source;
                me.systemInfo.show(jQuery(this), key, true);
            });
        },
        selectSource: function (value) {
            const currentValue = this.sourceSelection;
            if (currentValue !== null) {
                this.sourceElems[currentValue].removeClass('selected');
            }
            this.sourceElems[value].addClass('selected');
            this.sourceSelection = value;
        },
        /**
         * @method handleRadioButtons
         * Inits the on change listeners for the radio buttons
         */
        // TODO if source + radiobuttons are used then fix this -> trigger SourceSelectChange
        handleRadioButtons: function () {
            const me = this;
            const elem = this.getElement();
            elem.find('input[type=radio][name=load]').on('click', function (evt) {
                if (me.sourceSelection !== this.value && me.dataHandler.hasInputCoords()) {
                    const selectCb = function () {
                        jQuery(evt.target).prop('checked', true);
                        me.handleSourceSelection(evt.target.value);
                    };
                    evt.preventDefault();
                    me.confirmResetFlyout(true, selectCb);
                } else {
                    me.handleSourceSelection(this.value);
                }
            });
        }

    }
);
