const WATCH_JOB = 'CoordinateTransformJob';
/**
 * @class Oskari.mapframework.bundle.coordinatetool.CoordinateToolService
 */
Oskari.clazz.define('Oskari.coordinatetransformation.TransformationService',
/**
 * @method create called automatically on construction
 * @static
 */
    function (instance) {
        this._instance = instance;
        this._sandbox = instance.sandbox;
        this.urls = {};
        Oskari.urls.set(WATCH_JOB, '/coordinatetransform/watch/');

        this.urls.result = Oskari.urls.getRoute('GetConversionResult');
        this.urls.watchJob = Oskari.urls.getLocation(WATCH_JOB);
    }, {
        __name: 'coordinatetransformation.TransformationService',
        __qname: 'Oskari.coordinatetransformation.TransformationService',
        getQName: function () {
            return this.__qname;
        },
        getName: function () {
            return this.__name;
        },
        /**
     * Initializes the service (does nothing atm).
     *
     * @method init
     */
        init: function () {},

        requestUrlBuilder: function (crs, transformType, exportSettings) {
            const urlBase = Oskari.urls.getRoute('CoordinateTransformation');
            let urlParameterString =
            '&sourceCrs=' + crs.sourceCrs +
            '&targetCrs=' + crs.targetCrs +
            '&targetDimension=' + crs.targetDimension +
            '&sourceDimension=' + crs.sourceDimension +
            '&transformType=' + transformType;

            if (crs.sourceElevationCrs) {
                urlParameterString += '&sourceHeightCrs=' + crs.sourceElevationCrs;
            }
            if (crs.targetElevationCrs) {
                urlParameterString += '&targetHeightCrs=' + crs.targetElevationCrs;
            }
            if (exportSettings) {
                urlParameterString += '&exportSettings=' + encodeURIComponent(JSON.stringify(exportSettings.selects));
            }
            return urlBase + urlParameterString;
        },
        formDataBuilder: function (importSettings, exportSettings) {
            const formData = new FormData();
            if (exportSettings && exportSettings.selects) {
                formData.append('exportSettings', JSON.stringify(exportSettings.selects));
            }
            if (importSettings && importSettings.selects) {
                formData.append('importSettings', JSON.stringify(importSettings.selects));
            }
            if (importSettings.file) {
                formData.append('coordFile', importSettings.file);
            }
            return formData;
        },
        handleError: function (callback, jqXHR) {
            if (typeof callback !== 'function') {
                return;
            }
            let resp,
                errorInfo;
            try {
                resp = JSON.parse(jqXHR.responseText);
                if (resp.info) {
                    errorInfo = resp.info;
                }
            } catch (err) {
                Oskari.log(this.getName()).warn('Error whilst parsing json, error');
            }
            callback(errorInfo);
        },
        watchJob: function (jobId, successCb, errorCb) {
            const me = this;
            jQuery.ajax({
                type: 'GET',
                url: me.urls.watchJob + jobId,
                success: function (response, textStatus, jqXHR) {
                    if (response.jobId) {
                        me.watchJob(response.jobId, successCb, errorCb);
                        return;
                    }
                    successCb(response, textStatus, jqXHR);
                },
                error: function (jqXHR) {
                    me.handleError(errorCb, jqXHR);
                }
            });
        },
        watchFileJob: function (jobId, successCb, errorCb) {
            const me = this;
            jQuery.ajax({
                type: 'GET',
                url: me.urls.watchJob + jobId,
                success: function (response, textStatus, jqXHR) {
                    if (response.jobId) {
                        me.watchFileJob(response.jobId, successCb, errorCb);
                        return;
                    }
                    const type = jqXHR.getResponseHeader('Content-Type');
                    const filename = me.getFileNameFromResponse(jqXHR);
                    successCb(response, filename, type);
                },
                error: function (jqXHR) {
                    me.handleError(errorCb, jqXHR);
                }
            });
        },
        transformArrayToArray: function (coords, crs, successCb, errorCb) {
            const me = this;
            const url = this.requestUrlBuilder(crs, 'A2A');
            jQuery.ajax({
                contentType: 'application/json',
                type: 'POST',
                url: url,
                data: JSON.stringify(coords),
                success: function (response) {
                    me.watchJob(response.jobId, successCb, errorCb);
                },
                error: function (jqXHR) {
                    me.handleError(errorCb, jqXHR);
                }
            });
        },
        transformFileToArray: function (crs, fileSettings, successCb, errorCb) {
            const me = this;
            const url = this.requestUrlBuilder(crs, 'F2A');
            const formData = this.formDataBuilder(fileSettings);
            jQuery.ajax({
                contentType: false, // multipart/form-data
                type: 'POST',
                cache: false,
                processData: false,
                url: url,
                data: formData,
                success: function (response) {
                    me.watchJob(response.jobId, successCb, errorCb);
                },
                error: function (jqXHR) {
                    me.handleError(errorCb, jqXHR);
                }
            });
        },
        readFileToArray: function (crs, fileSettings, successCb, errorCb) {
            const me = this;
            const url = this.requestUrlBuilder(crs, 'F2R');
            const formData = this.formDataBuilder(fileSettings);
            jQuery.ajax({
                contentType: false, // multipart/form-data
                type: 'POST',
                cache: false,
                processData: false,
                url: url,
                data: formData,
                success: function (response) {
                    successCb(response);
                },
                error: function (jqXHR) {
                    me.handleError(errorCb, jqXHR);
                }
            });
        },
        transformArrayToFile: function (coords, crs, fileSettings, successCb, errorCb) {
            const me = this;
            const url = this.requestUrlBuilder(crs, 'A2F', fileSettings);
            jQuery.ajax({
                contentType: 'application/json',
                type: 'POST',
                url: url,
                data: JSON.stringify(coords),
                success: function (response) {
                    me.watchFileJob(response.jobId, successCb, errorCb);
                },
                error: function (jqXHR) {
                    me.handleError(errorCb, jqXHR);
                }
            });
        },
        transformFileToFile: function (crs, importSettings, exportSettings, successCb, errorCb) {
            const me = this;
            const url = this.requestUrlBuilder(crs, 'F2F');
            const formData = this.formDataBuilder(importSettings, exportSettings);
            jQuery.ajax({
                contentType: false, // multipart/form-data
                type: 'POST',
                cache: false,
                processData: false,
                url: url,
                data: formData,
                success: function (response, textStatus, jqXHR) {
                    me.watchFileJob(response.jobId, successCb, errorCb);
                },
                error: function (jqXHR) {
                    me.handleError(errorCb, jqXHR);
                }
            });
        },
        getFileNameFromResponse: function (xhr) {
            const disposition = xhr.getResponseHeader('Content-Disposition');
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            if (disposition) {
                const matches = filenameRegex.exec(disposition);
                if (matches[1]) {
                    return matches[1];
                }
            }
            return 'results.txt';
        }
    }, {
        protocol: ['Oskari.mapframework.service.Service']
    });
