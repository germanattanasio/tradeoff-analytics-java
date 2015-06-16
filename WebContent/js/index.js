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
  var lastTheme = $("#themes option:first").val();
  var lastProfile = 'basic';
  var MIN_BAR_SLIDE_PERIOD = 500;
  var currentProblem = null;

  /**
   * Smooth scroll to any DOM element
   * @param  {String} DOM element
   */
  function jumpTo(h,animate) {
	if (animate === undefined || animate) {
		$('html, body').animate({
			scrollTop: $(h).offset().top
		}, 500);
    }
    else {
    	$(h)[0].scrollIntoView();
    }
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
    taClient = new TA.TradeoffAnalytics({
      dilemmaServiceUrl: 'demo',
      customCssUrl: 'https://ta-cdn.mybluemix.net/v1/modmt/styles/' + themeName + '.css',
      profile: profile
    }, 'taWidgetContainer');

    taClient.subscribe('afterError', errCallback);
    taClient.subscribe('doneClicked', onResultSelection);
    
    var topics = [ 'started', 'problemChanged', 'destroyed', 'doneClicked', 'optionClicked', 'X_finalDecisionChanged',
        'X_favoritesChanged', 'X_selectionChanged', 'X_filterChanged'/*, 'X_optionHovered'*/ ];
    topics.forEach(function(t){
      taClient.subscribe(t, function (e){
        console.log(JSON.stringify(e));
      });
    });
    
    taClient.start(callback);
  }

  function showTradeoffAnalytcsWidget(problem) {
    taClient.show(problem, onResultsReady);
    currentProblem = problem;
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
        className: c.is_objective ? c.goal.toUpperCase() === 'MIN' ? 'minimize' : 'maximize' : 'info'
      }, tr);
      var iconClassName = c.is_objective ? c.goal.toUpperCase() === 'MIN' ? 'legendIconMin' : 'legendIconMax' : 'legendIconNone';
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

  function onResultSelection(event) {
    onRestore();
    if (event.selectedOptionKeys) {
      $('.decisionArea').show();
      var selectedOptionKey = event.selectedOptionKeys[0];//currently, maximum one option is selected 
      var firstOptionName = currentProblem.options.filter(function(op){
        return op.key === selectedOptionKey;
      })[0].name;
      $('.decisionText').text(firstOptionName);
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
    	if (error.responseText) {
    		errorMsg = error.responseText;
    	}
    	else {
	    	try { 
	    		errorMsg = JSON.stringify(error, null, 4);
	    	}
	    	catch (e) { // a complex object - can't be converted to json, take it's toString representation
	    		errorMsg = error.toString();
	    	}
	    }
    }
    $('.errorMsg').text(errorMsg);
    $('.errorArea').show();
    onPageReady();
    jumpTo(".errorArea");
  }

  window.onerror = onError;

  function onMaximize() {
	$('#minimizeBar').show();
    $('#taWidgetContainer').addClass('fullsize');
    $(document.documentElement).addClass('noScroll');

    window.onkeyup = function(key) {
      if (key.keyCode === 27) onRestore();
    };
    
    resizeToParent();
  }

   function showMinimizeBar() {
	$('#visibleMinimizeBar').stop(true);
	$('#visibleMinimizeBar').animate({
		top: 0
	}, MIN_BAR_SLIDE_PERIOD	);
	$('#taWidgetContainer').stop(true);
	$('#taWidgetContainer').animate({
			top: 20
	}, MIN_BAR_SLIDE_PERIOD	);
  }
  
  function hideMinimizeBar() {
    if ($('#minimizeBar').is(':visible')) { // still visible after the timeout
       $('#taWidgetContainer').stop(true);
       $('#taWidgetContainer').animate({
		 top: 0
       }, MIN_BAR_SLIDE_PERIOD);
       $('#visibleMinimizeBar').stop(true);
	   $('#visibleMinimizeBar').animate({
	  	 top: -19
	  }, MIN_BAR_SLIDE_PERIOD);
	}
  }
    
  function onRestore() {
	$('#minimizeBar').hide();
	window.onkeyup = null;
	$('#taWidgetContainer').stop(true);
    $('#taWidgetContainer').css('top','0px');
	$('#visibleMinimizeBar').stop(true);
    $('#visibleMinimizeBar').css('top','-19px');
    $('#taWidgetContainer').removeClass('fullsize');
    $(document.documentElement).removeClass('noScroll');
    resizeToParent();
    jumpTo('#taWidgetContainer',false);
  }

  function loadProfile(profileName) {
    $.get('advanced/profiles/' + profileName, function(data) {
      $('#featuresText').val(data);
    });
  }

  function onProfileChanged() {
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
  }

  function onThemeChanged() {
    loadTheme($('#themes').val());
  }

  function loadTheme(themeName) {
    $.get('advanced/themes/' + themeName + '.less', function(data) {
      $('#themeText').val(data);
    });
  }

  function recreateWidgetIfNeeded(showWidget) {
	var showAdvanced = $('.showAdvance').val() === 'yes';
	var selectedProfile = showAdvanced ?  $('.profiles').val() : 'basic';
    var selectedTheme =  showAdvanced ?  $('#themes').val() : $("#themes option:first").val();
	var profile = showAdvanced && selectedProfile === 'custom' ? JSON.parse($('#featuresText').val()) : selectedProfile;
    
    if (selectedTheme !== lastTheme || JSON.stringify(profile) !== JSON.stringify(lastProfile))  {
	  destroyTradeoffAnalytcsWidget(function() {
		loadTradeoffAnalytics(profile, selectedTheme, showWidget, onError);
	  });
    } else {
    	showWidget();
    }
    
    lastProfile = profile;
    lastTheme = selectedTheme;
  }
  
  function openAdvanced() {
	  $('.showAdvance').val('yes');
	  toggleAdvance();
	  jumpTo('.advancedArea');
  }
  
  // On page load
  $(document).ready(onPageLoad);

  // Problem events
  $('.problems').change(loadSelectedProblem);
  $('.problemText').change(onProblemChanged);
  $('.viewTable').click(toggleTable);
  $('#advancedLink').click(openAdvanced);

  // Advance customization events
  $('.showAdvance').change(toggleAdvance);
  $('.profiles').change(onProfileChanged);
  $('.themes').change(onThemeChanged);

  // Visualization events
  $('#maximize').click(onMaximize);
  $('#minimize').click(onRestore);
  
  var timeoutHandle = null; 
    
  $('#minimizeBar').mouseenter(function() {
	  if (timeoutHandle) {
		clearTimeout(timeoutHandle);
		timeoutHandle = null;
	  }
	  showMinimizeBar();
  });
  
  $('#minimizeBar').mouseleave(function() {
	 if ($('#minimizeBar').is(':visible')) {
		 timeoutHandle = setTimeout(hideMinimizeBar,500);
	 }
  });

  // Analyze button
  $('.analyze').click(onAnalyzeClick);

})();
