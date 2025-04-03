Oskari.clazz.define('Oskari.coordinatetransformation.component.CoordinateTable', function (view, loc, type) {
    this.loc = loc;
    this.type = type;
    Oskari.makeObservable(this);
    this.container = null;
    this.defaultTableRows = 10;
    this.isEditable = false;
    this.scrollTimer = null;
    this.template = {
        tableWrapper: ({ type, title }) =>
            `<div class="coordinate-table-wrapper ${type}">
                <h5>${title}</h5>
                <div class="oskari-table-header"></div>
                <div class="oskari-table-content"></div>
            </div>`,
        rowcounter: ({ rows }) => `<div class="rowcount"><span class="row-counter">0</span> ${rows}</div>`,
        header: ({ col1, col2, elev }) =>
            `<table class="oskari-tbl-header" cellpadding="0" cellspacing="0" border="0">
                <thead>
                    <tr>
                        <th>${col1}</th>
                        <th>${col2}</th>
                        <th class="elevation">${elev}</th>
                    </tr>
                    </thead>
            </table>`,
        row: ({ coords }) =>
            `<tr>
                <td class="cell">
                    <div class="cellContent">${coords.col1 || ''}</div>
                </td>
                <td class="cell">
                    <div class="cellContent">${coords.col2 || ''}</div>
                </td>
                <td class="cell elevation oskari-hidden">
                    <div class="cellContent">${coords.elev || ''}</div>
                </td>
                <td class="cell control">
                    <div class="removerow"></div>
                </td>
            </tr>`,
        table: () =>
            `<table class="hoverable oskari-coordinate-table two-dimensions" cellpadding="0" cellspacing="0" border="0">
                <tbody></tbody
            </table>`
    };
}, {
    getContainer: function () {
        return jQuery(this.container);
    },
    getElements: function () { // TODO: store references
        const elements = {
            table: this.getContainer().find('.oskari-coordinate-table'),
            rows: this.getContainer().find('.oskari-coordinate-table tr'),
            header: this.getContainer().find('.oskari-tbl-header'),
            tableContent: this.getContainer().find('.oskari-table-content')
        };
        return elements;
    },
    setElement: function (el) {
        this.container = el;
    },
    /**
         * @method displayTableElevationRow
         * @param {boolean} display - true - display the row, false - hide or grey out depending if there is data in the row
         * @desc handle hiding and showing the elevation row in the table
         */
    handleDisplayingElevationRows: function (dimension) {
        const elevationCells = this.getElements().rows.find('.elevation');
        const table = this.getElements().table;
        if (dimension === 2) {
            // elevationCells.attr("contenteditable", false); //TODO always??
            // check if elevationcells have value, if true don't hide but grey out
            /* elevationCells.each( function (key, val) {
                    var element = jQuery( val );
                    element.html().trim();
                    if ( !element.is(':empty') ) {
                        isEmpty = false;
                    }
                });
                if ( !isEmpty ) {
                    elevationCells.addClass('cell-disabled');
                } else { */
            elevationCells.addClass('oskari-hidden');
            table.addClass('two-dimensions');
            table.removeClass('three-dimensions');
            // }
        } else {
            // elevationCells.attr("contenteditable", true); //TODO always??

            /* if ( elevationCells.hasClass('cell-disabled') ) {
                    elevationCells.removeClass('cell-disabled');
                } else if( !elevationCells.hasClass('oskari-hidden') ) {
                    return;
                } else { */
            elevationCells.removeClass('oskari-hidden');
            table.addClass('three-dimensions');
            table.removeClass('two-dimensions');
            // }
        }
    },
    // bind to all rows if row is not given
    bindHoverRow: function (row) {
        const me = this;
        const data = {};
        const rows = row || this.getElements().rows;
        rows.on('mouseenter', function () {
            data.index = jQuery(this).index();
            data.highlight = true;
            me.trigger('HighlightTableRow', data);
        });
        rows.on('mouseleave', function () {
            data.index = jQuery(this).index();
            data.highlight = false;
            me.trigger('HighlightTableRow', data);
        });
    },
    bindTableScroll: function () {
        const me = this;
        const content = this.getElements().tableContent;
        content.on('scroll', function (evt) {
            clearTimeout(me.scrollTimer);
            me.scrollTimer = setTimeout(function () {
                me.trigger('TableScroll', content.scrollTop());
            }, 50);
        });
    },
    scrollTable: function (value) {
        const content = this.getElements().tableContent;
        content.scrollTop(value);
    },
    highlightRow: function (data) {
        const index = data.index + 1;
        const selector = 'tr:nth-child(' + index + ')';
        const table = this.getElements().table;
        if (data.highlight) {
            table.find(selector).addClass('highlighted');
        } else {
            table.find(selector).removeClass('highlighted');
        }
    },
    create: function () {
        let title;
        if (this.type === 'input') {
            title = this.loc('flyout.coordinateTable.input');
        } else {
            title = this.loc('flyout.coordinateTable.output');
        }
        const tableWrapper = jQuery(this.template.tableWrapper({
            title: title,
            type: this.type
        }));
        const rowcounter = this.template.rowcounter({
            rows: this.loc('flyout.coordinateTable.rows')
        });
        const table = this.template.table();
        /* title: "title",
                north:this.loc('flyout.coordinateTable.north'),
                east:this.loc('flyout.coordinateTable.east'),
                ellipse_elevation: ""
            }); */
        tableWrapper.find('.oskari-table-content').append(table);
        tableWrapper.find('h5').append(rowcounter);

        this.setElement(tableWrapper);

        // this.bindRowCountListener();

        // var coords = {};
        // var tableRef = tableWrapper.find(".oskari-coordinate-table");

        for (let i = 0; i < this.defaultTableRows; i++) {
            // tableRef.append(this.template.row( { coords: coords } ) );
            this.addEmptyRow();
        }
        this.bindTableScroll();
        return this.getContainer();
    },
    /**
         * @method render
         * @param { Array } coords, array of coordinate arrays
         */
    render: function (coords, dimension) {
        const table = this.getElements().table;
        let row;
        const rowData = {};
        let coord;
        this.emptyTableCells();
        for (let i = coords.length - 1; i >= 0; i--) {
            coord = coords[i];
            rowData.col1 = coord[0];
            rowData.col2 = coord[1];
            if (coord.length === 3) {
                rowData.elev = coord[2];
            }
            row = jQuery(this.template.row({ coords: rowData }));
            this.bindHoverRow(row);
            table.prepend(row);
        }
        this.handleTableSize(coords.length, true);
        this.handleDisplayingElevationRows(dimension);
        // table.trigger('RowCountChanged');
    },
    displayNumberOfDataRows: function (number) {
        this.getContainer().find('.row-counter').text(number); // TODO store ref
    },
    setIsEditable: function (editable) {
        this.isEditable = editable;
        const rows = this.getElements().rows;
        rows.each(function () {
            jQuery(this).find('.cellContent').attr('contenteditable', editable);
        });
    },
    emptyTableCells: function () {
        const isEditable = this.isEditable;
        let cell;
        const rows = this.getElements().rows;
        for (let i = 0; i < rows.length; i++) {
            jQuery(rows[i]).find('.cellContent').each(function () {
                cell = jQuery(this);
                cell.text('');// empty();
                cell.removeClass('invalid-coord');
                cell.attr('contenteditable', isEditable);
            });
        }
    },
    handleTableSize: function (dataRows, isRender) {
        // TODO event??
        let i = this.defaultTableRows;
        const rows = this.getElements().rows;
        // remove empty rows
        if (isRender === true) {
            if (dataRows > this.defaultTableRows) {
                i = dataRows;
            }
            for (i; i < rows.length; i++) {
                const indexRow = jQuery(rows[i]);
                indexRow.remove();
            }
            // add empty row (keyboard/table input)
        } else if (dataRows + 2 > rows.length) {
            this.addEmptyRow();
        }
        this.displayNumberOfDataRows(dataRows);
        this.setIsEditable(this.isEditable); // TODO
        // this.getElements().table.trigger('RowCountChanged');
    },
    addEmptyRow: function () {
        const newRow = jQuery(this.template.row({ coords: {} }));
        /* if(this.isEditable){
                jQuery(newRow).find('td').attr("contenteditable", true);
            } else {
               jQuery(newRow).find('td').attr("contenteditable", false);
            } */
        this.getElements().table.append(newRow);
        this.bindHoverRow(newRow);
    },
    /* bindRowCountListener: function () {
            var me = this;
            var table = this.getElements().table;

            table.on('RowCountChanged', function (evt) {
                var rows = jQuery(evt.currentTarget).find('tr');
                var number = 0;
                for ( var i = 0; i < rows.length; i++ ) {
                    var indexRow = jQuery( rows[i] );
                    if ( indexRow.children().first().html() !== "" ) {
                        number++;
                    }
                }
                me.displayNumberOfDataRows( number );
            });
        }, */
    updateHeader: function (epsgValues, elevSystem, isAxisFlip) {
        this.getElements().header.remove();
        if (!epsgValues || !epsgValues.coord) {
            return;
        }
        let x = '';
        let y = '';
        let z = '';
        const lonFirst = isAxisFlip === true ? !epsgValues.lonFirst : epsgValues.lonFirst;
        const coordSystem = epsgValues.coord;
        let header;
        let temp;

        switch (coordSystem) {
        case 'COORD_PROJ_3D':
            x = this.loc('flyout.coordinateTable.geoX');
            y = this.loc('flyout.coordinateTable.geoY');
            z = this.loc('flyout.coordinateTable.geoZ');
            break;
        case 'COORD_PROJ_2D':
            x = this.loc('flyout.coordinateTable.east');
            y = this.loc('flyout.coordinateTable.north');
            break;
        case 'COORD_GEOG_3D':
            z = this.loc('flyout.coordinateTable.ellipseElevation');
        case 'COORD_GEOG_2D':
            x = this.loc('flyout.coordinateTable.lon');
            y = this.loc('flyout.coordinateTable.lat');
            break;
        default:
            break;
        }
        if (!lonFirst) {
            temp = y;
            y = x;
            x = temp;
        }
        if (elevSystem) {
            z = this.loc('flyout.coordinateTable.elevation');
        }
        header = this.template.header({
            col1: x,
            col2: y,
            elev: z
        });
        header = jQuery(header);
        if (z === '') {
            header.find('th').addClass('two');
            header.find('.elevation').css('display', 'none');
        } else {
            header.find('th').addClass('three');
        }
        this.getContainer().find('.oskari-table-header').append(header);
    },
    handleClipboardPasteEvent: function () {
        const me = this;
        const cells = document.getElementsByClassName('cell');

        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener('paste', function (e) {
                e.stopPropagation();
                e.preventDefault();

                // Get pasted data via clipboard API
                const clipboardData = e.clipboardData || window.clipboardData;
                const pastedData = clipboardData.getData('Text');

                const dataJson = me.transformView.dataHandler.validateData(pastedData);
                me.transformView.updateCoordinateData('input', dataJson);
            });
        }
    }
}, {

});
