$(document).ready(function() {

    $(document).on('submit', '.more-info-form', function(e) {

        
        if ($(this).parents('.live-chat-form').length) return true;
        
        e.preventDefault;

        
        
        var formVals = _.reduce($(this).find('input,textarea,select'), function(m, elem) {
            if (elem.name == "") return m;
            if (elem.type == 'checkbox') {
                m[elem.name] = elem.checked;
            } else {
                m[elem.name] = elem.value;
            }
            if (elem.type == 'radio' && elem.checked) {
                m[elem.name] = elem.value;
            }
            return m;
        }, {});

        $(this).find('[type="submit"]').addClass('submitting').attr('disabled', 'disabled');

        
        formVals['type'] = window.globalFormType ? globalFormType : 'nn_more_info_form';
        formVals['typeClass'] = 'nn_contact_form';
        formVals['workflowStatus'] = 'needs_answer';
        formVals['scheduleStatus'] = 'not_scheduled';
        formVals['commStatus'] = 'needs_initial_answer';

        var that = this;

        email_validate(formVals.email, function() {
            sendForm(that, formVals);
        }, function() {
            email_validation_error(formVals.email, that);
        });

        return false;

    });

    
    function sendForm(that, formVals) {

        $.ajax({
            url: globalReachesEndpoint,
            data: formVals,
            dataType: 'jsonp',
            timeout: 15000,
            success: function(data) {
                if (data && data.result && !data.error) {
                    
                    setTimeout(function() {
                        $(that).find('[type="submit"]').removeClass('submitting').html(window._gcui_submitted ? _gcui_submitted : 'Submitted');
                        $(that).addClass('success-message');
                    }, 1000);

                    window.globalFormSubmittionSuccess && globalFormSubmittionSuccess();

                } else {
                    
                    formError(that, data);    
                }
            },
            error: function() {
                formError(that, arguments);
            }
        });

    }

    
    var emailValidateSecondTry = false;

    $(document).on('blur', 'input[name="email"]', function(e) {
        emailValidateSecondTry = false;
    });

    function email_validate(email, successCallback, errorCallback) {

        
        if (emailValidateSecondTry) return successCallback();

        $.ajax({
            url: '/form/email_validate.action?email=' + email,
            headers: {Warning: 42},
            success: function(data) {
                if (data == "UNAUTHORIZED" || data == "VALIDATED") return successCallback();
                errorCallback();
            },
            error: function(xhr, status, error) {
                var err = xhr.responseText;
                window.console && console.error && console.error(err);
                errorCallback();
            }
        });
    }

    
    function email_validation_error(email, that) {
        emailValidateSecondTry = true;
        window.console && console.error && console.error('email validation error');
        _tr.push(['_trackEvent', 'Errors', document.location + '', 'email did not validate (' + email + ')']);
        alert('Sorry, your email address does not appear to be valid. Please review it and try again.');
        $(that).find('[type="submit"]').removeClass('submitting').removeAttr('disabled');
    }

});

function formError(formDom, data) {
    window.console && console.error && console.error("form submission error:");
    window.console && console.error && console.error(data);
    alert('There was an error in submitting your form! Please try again later.');
    $(formDom).find('[type="submit"]').removeClass('submitting').removeAttr('disabled');
}

$(document).ready(function() {

    
    var cc = 0;
    $(document).on('keyup mouseup', function (e) {
        if (cc++ == 2) $('[name=captcha]').val('V@3fsasdfasdfAAdgf9J*');
    });

    
    $('.autowired input[type="text"], .autowired textarea, .autowired select').each(function() {
        if (!$(this).attr('id') && $(this).attr('name')) $(this).attr('id', $(this).attr('name'));
        if ($(this).attr('id') && !$(this).attr('name')) $(this).attr('name', $(this).attr('id'));
    });

    
    var $countryElem = $('[name="countryCode"]');
    var $stateElem = $('[name="stateProvince"]');
    var defaultCountry = 'US';
    var firstStateUpdate = true;

    $countryElem.on('change', function(e) {
        updateStateList();
    });

    setTimeout(function() {

        if (window.globalGeolocationData) {
            var defaultCountry = safeNav('globalGeolocationData.estimated_location.country_code');
            if (defaultCountry) defaultCountry = defaultCountry.toUpperCase();
            $countryElem.val(defaultCountry);
            updateStateList();
            _idmgr_org_pref_set_callback();
        } else {
            $(document).bind('geolocated', function() {
                var defaultCountry = safeNav('globalGeolocationData.estimated_location.country_code');
                if (defaultCountry) defaultCountry = defaultCountry.toUpperCase();
                $countryElem.val(defaultCountry);
                updateStateList();
                _idmgr_org_pref_set_callback();
            });
        }

    }, 500);

    
    $.getScript('/theme/js/polyfiller.js', function() {
        
        
        webshim.setOptions('basePath', '/theme/js/shims/');
        webshim.polyfill('forms');
    });

    $(document).on('keyup', 'input[type="text"],textarea', function(e) {
        $(this).removeClass('errored');
    });

    
    function updateStateList() {

        if (!$countryElem.val()) return;

        var countrySelected = $countryElem.val().toUpperCase();
        
        $.ajax({
            url: _gcui_sd_url + '/lookups/state_list.html?countryCode=' + countrySelected,
            dataType: 'jsonp',
            cache: true,
            jsonpCallback: 'state_list_lookup_callback',
            success: function(data) {
                $stateElem.html(_gcui_selectElem +
                    _.reduce(data, function(m, v, k) {
                        return m + '<option value="' + k + '">' + v + '</option>';
                    }, '') +
                    '<option data-other="true" value="other">' + _gcui_otherText + '</option>'
                );
                if (firstStateUpdate) {
                    var defaultState = safeNav('globalGeolocationData.estimated_location.region_code');
                    if (defaultState) defaultState = defaultState.toUpperCase();
                    if (defaultState && $stateElem.find('[value="' + defaultCountry + '-' + defaultState + '"]').length) $stateElem.val(defaultCountry + '-' + defaultState);
                    firstStateUpdate = false;
                } else {
                    $stateElem.find('[value=""]').attr('selected', 'selected');
                }

            },
            error: function(xhr, status, error) {
                var err = xhr.responseText;
                window.console && console.error && console.error(err);
                $stateElem.html(_gcui_selectElem + '<option data-other="true" value="other">' + _gcui_otherText + '</option>');
            }
        });
    }

});



function safeNav(stringOfDotSeparatedParameters) {
    var returnObject = window, parameters = stringOfDotSeparatedParameters.split('.'), i, parameter;
    for (i = 0; i < parameters.length; i++) {
        parameter = parameters[i];
        returnObject = returnObject[parameter];
        if (returnObject === undefined)  return undefined;
    }
    return returnObject;
};


function safeNav2(obj, stringOfDotSeparatedParameters) {
    var returnObject = obj, parameters = stringOfDotSeparatedParameters.split('.'), i, parameter;
    for (i = 0; i < parameters.length; i++) {
        parameter = parameters[i];
        returnObject = returnObject[parameter];
        if (returnObject === undefined)  return undefined;
    }
    return returnObject;
};





var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'http://' + globaldata_domain3 + '/geolocate.action' +
    '?campaign=narconon&results=5&callback=center_selected';

function center_selected(data) {

    gcui_log('geolocated data received:');
    gcui_log(data);

    globalNNGeodata = data;
    if (window.map) {
        map.setCenter({lat: globalNNGeodata.Location.Location.Latitude, lng: globalNNGeodata.Location.Location.Longitude});
        map.setZoom(8);
    }

    
    var nearstOrg;
    for (var i in globalNNGeodata.NearestOrgs) {
        var center = globalNNGeodata.NearestOrgs[i].Org;
        if (!nearstOrg && center.Type != 'drug_education_center' && center.Id != "narconon-ojai") {
            nearstOrg = center;
        }
    }

    if (nearstOrg || window.globalNearestCenterFromDomain) {
        if ($('select[name="orgId"]').length) $('select[name="orgId"]')[0].selectedIndex = $('select[name="orgId"] option').index($('select[name="orgId"] [value="' +
                (window.globalNearestCenterFromDomain ? globalNearestCenterFromDomain : nearstOrg.Id) +
            '"]'));
        if ($('input[name="missionId"]').length)  $('input[name="missionId"]')[0].value = nearstOrg.Id;
    }

    
    document.getElementsByTagName('head')[0].removeChild(script);
    script = null;

}

document.getElementsByTagName('head')[0].appendChild(script);



var form_location_data = form_location_data || {};

function _idmgr_org_pref_set_callback() {

    gcui_log('IDMGR: location detection callback called');

    var org_data = {result: globalGeolocationData};

    if (globalGeolocationData == null || org_data.result.estimated_location == null) {
        
        gcui_log('ERROR: IDMGR: no geolocation data available');        
        return;
    }

    
    form_location_data['latitude'] = org_data.result.estimated_location.latitude;
    form_location_data['longitude'] = org_data.result.estimated_location.longitude;

    form_location_data['address_data_from_geolocation'] = {
        area_code: org_data.result.estimated_location.area_code,
        city: org_data.result.estimated_location.city,
        country_code: org_data.result.estimated_location.country_code,
        postal_code: org_data.result.estimated_location.postal_code,
        region_code: org_data.result.estimated_location.region_code
    };

    $('.edit-submitted-gcui-submit-data-hidden').val(JSON.stringify(form_location_data));
    
}