/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Anonymous function, to use as a wrapper
 */
(function() {

  // GLOBAL VARIABLES
  var taClient = null;
  var themeChanged = false;
  var profileChanged = false;

  /**
   * Smooth scroll to any DOM element
   * @param  {String} DOM element
   */
  function jumpTo(h) {
    $('html, body').animate({
        scrollTop: $(h).offset().top
    }, 500);
  }

  function createDom(elem, map, parent) {
    var e = document.createElement(elem);
    for (var k in map) {
      e[k] = map[k];
    }
    if (parent) {
      parent.appendChild(e);
    }
    return e;
  }

  function assertNotTrue(cond, message) {
    if (!cond) {
      throw message;
    }
  }

  /**
   * Wrapper around the API
   */
  function loadTradeoffAnalytics(profile, themeName, callback, errCallback) {
    taClient = new TradeoffAnalytics({
      dilemmaServiceUrl: 'demo',
      customCssUrl: 'https://ta-cdn.mybluemix.net/modmt/styles/' + themeName + '.css',
      profile: profile,
      errCallback: errCallback
    }, 'taWidgetContainer');

    taClient.start(callback);
  }

  function showTradeoffAnalytcsWidget(problem) {
    taClient.show(problem, onResultsReady, onResultSelection);
  }

  function destroyTradeoffAnalytcsWidget(callback) {
    taClient.destroy(callback);
  }

  /**
   * Resizes the widget based on the parent DOM element size
   */
  function resizeToParent() {
    taClient.resize();
  }

  function onPageReady() {
    $('.analyze').show();
    $('.loading').hide();
  }

  function onPageLoad() {
    loadTradeoffAnalytics('basic', 'watson', onPageReady, onError);
    loadSelectedProblem();
    loadProfile('basic');
    loadTheme('watson');
  }

  function onProblemChanged() {
    var tableParent = document.getElementById('tablePlaceHolder');
    while (tableParent.childElementCount > 0) {
      tableParent.removeChild(tableParent.childNodes[0]);
    }
    try {
      var problem = JSON.parse($('.problemText').val());
      assertNotTrue(problem, 'Empty Problem');
      assertNotTrue($.isArray(problem.columns), 'Invalid problem columns');
      assertNotTrue($.isArray(problem.options), 'Invalid problem options');

      createOptionsTable(problem, tableParent);
    } catch (err) {
      onError({error:'JSON parsing error'});
    }
  }

  function loadSelectedProblem() {
    var path = 'problems/' + $('.problems').val();
    $.getJSON(path, function(data) {
      $('.problemText').val(JSON.stringify(data, null, 2)).change();
    });
  }

  function createOptionsTable(problem, parent) {
    var table = createDom('table', {}, parent);
    var tr = createDom('tr', {}, table);
    createDom('th', {
      innerHTML: 'Id'
    }, tr);
    createDom('th', {
      innerHTML: 'Name'
    }, tr);

    problem.columns.forEach(function(c) {
      var th = createDom('th', {
        className: c.is_objective ? c.goal === 'MIN' ? 'minimize' : 'maximize' : 'info'
      }, tr);
      var iconClassName = c.is_objective ? c.goal === 'MIN' ? 'legendIconMin' : 'legendIconMax' : 'legendIconNone';
      createDom('span', {
        className: 'legendIcon ' + iconClassName
      }, th);
      createDom('span', {
        innerHTML: c.full_name
      }, th);
    });
    problem.options.forEach(function(op, i) {
      var tr = createDom('tr', {
        className: i % 2 ? 'odd' : 'even'
      }, table);
      createDom('td', {
        innerHTML: op.key
      }, tr);
      createDom('td', {
        innerHTML: op.name
      }, tr);
      problem.columns.forEach(function(c) {
        createDom('td', {
          innerHTML: op.values[c.key] || 0
        }, tr);
      });
    });
    return table;
  }

  /**
   * Hack to hide the .result DOM element, we can't use $().hide()
   * Because FF doesn't support that if there is an iframe involve
   */
  function hideResults() {
    $('.viz').addClass('result');
  }

  /**
   * Show the .result DOM element
   */
  function showResults() {
    $('.viz').removeClass('result');
  }

  function onAnalyzeClick() {
    $('.analyze').hide();
    $('.loading').show();
    $('.decisionArea').hide();

    $('.errorArea').hide();
    hideResults();

    var problemJson = getJsonFromElement($('.problemText'));
    if (!problemJson)
      return;

    var featuresJson = getJsonFromElement($('.featuresText'));
    if (!featuresJson)
      return;

    recreateWidgetIfNeeded(function() {
      showTradeoffAnalytcsWidget(problemJson);
    });

  }

  function onResultsReady() {
    $('.analyze').show();
    $('.loading').hide();

    showResults();
    resizeToParent();
    onPageReady();
    jumpTo('#taWidgetContainer');
  }

  function onResultSelection(selection) {
    onRestore();
    if (selection) {
      $('.decisionArea').show();
      $('.decisionText').text(selection.name);
      jumpTo('.decisionArea');
    } else {
      $('.decisionText').text('');
      $('.decisionArea').hide();
    }
  }

  function getJsonFromElement(element) {
    var elementJson = null;
    try{
      elementJson = JSON.parse(element.val());
    } catch(e) {
      element.css('border','1px solid red');
      onError({error: 'JSON is malformed.'});
      return elementJson;
    }
    element.css('border','1px solid grey');
    $('.errorArea').hide();
    return elementJson;
  }

  function toggleTable() {
    if (!getJsonFromElement($('.problemText')))
      return;

    var hidden = $('.tableArea').is(':hidden');
    if (hidden) {
      $('.tableArea').show();
      $('.problemArea').hide();
      $('.viewTable').text('View / Edit JSON');
    } else {
      $('.tableArea').hide();
      $('.problemArea').show();
      $('.viewTable').text('Back to Table');
    }
    $('.problems').focus();
  }

  function toggleAdvance() {
    var hide = $('.showAdvance').val() === 'no';
    if (hide) {
      $('.advancedArea').hide();
    } else {
      $('.advancedArea').show();
    }
  }

  function onError(error) {
    var errorMsg = 'Error processing the request.';
    if (error) {
      try { 
        errorMsg = JSON.stringify(error, null, 4);
      } catch (e) {
        // a complex object - can't be converted to json, take it's string representation
        errorMsg = error;
      }
    }

    $('.errorMsg').text(errorMsg);
    $('.errorArea').show();
    onPageReady();
    jumpTo(".errorArea");
  }

  window.onerror = onError;

  function onMaximize() {
    $('#taWidgetContainer').addClass('fullsize');
    $(document.documentElement).addClass('noScroll');

    window.onkeyup = function(key) {
      if (key.keyCode === 27) onRestore();
    };

    resizeToParent();
  }

  function onRestore() {
    window.onkeyup = null;
    $('#taWidgetContainer').removeClass('fullsize');
    $(document.documentElement).removeClass('noScroll');
    resizeToParent();
    jumpTo('#taWidgetContainer');
  }

  function loadProfile(profileName) {
    $.get('advanced/profiles/' + profileName, function(data) {
      $('#featuresText').val(data);
    });
  }

  function onProfileChanged() {
    profileChanged = true;
    var profileName = $('.profiles').val();
    if (profileName === 'custom') {
      profileName = 'basic';
      $('.featuresText').removeAttr('readonly');
    } else {
      $('.featuresText').attr('readonly','readonly');
    }
    loadProfile(profileName);
  }

  function onFeaturesChange() {
    profileChanged = true;
  }

  function onThemeChanged() {
    loadTheme($('#themes').val());
    themeChanged = true;
  }

  function loadTheme(themeName) {
    $.get('advanced/themes/' + themeName + '.less', function(data) {
      $('#themeText').val(data);
    });
  }

  function recreateWidgetIfNeeded(callback) {
    if (profileChanged) {
      var profile;
      if ($('.showAdvance').val() === 'no') {
        profile = 'basic';
      } else {
        var selectedProfile = $('.profiles').val();
        profile = (selectedProfile === 'custom') ? JSON.parse($('#featuresText').val()) : selectedProfile;
      }
    }

    if (themeChanged || profileChanged) {
      var themeName = $('#themes').val() || 'basic';
      if (taClient) {
        destroyTradeoffAnalytcsWidget(function() {
          loadTradeoffAnalytics(profile, themeName, callback, onError);
        });
      }
    } else {
      callback();
    }
    themeChanged = false;
    profileChanged = false;
  }

  // On page load
  $(document).ready(onPageLoad);

  // Problem events
  $('.problems').change(loadSelectedProblem);
  $('.problemText').change(onProblemChanged);
  $('.viewTable').click(toggleTable);

  // Advance customization events
  $('.showAdvance').change(toggleAdvance);
  $('.profiles').change(onProfileChanged);
  $('.themes').change(onThemeChanged);
  //$('.featuresText').change(onFeaturesChange());

  // Visualization events
  $('.maximize').click(onMaximize);

  // Analyze button
  $('.analyze').click(onAnalyzeClick);

})();
