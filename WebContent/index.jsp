<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<html lang="en">

<head>
   <title>Tradeoff Analytics</title>
   <meta charset="utf-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
   <link rel="icon" href="images/favicon.ico" type="image/x-icon">
   <link rel="stylesheet" href="css/watson-bootstrap-dark.css">
   <link rel="stylesheet" href="css/banner.css">
   <link rel="stylesheet" href="css/style.css">
</head>

<body>
   <div class="container">
       <div class="row">
           <div class="col-lg-12">
               <div class="row top-nav">
                   <div class="col-lg-12">
                       <h3 class="heading left">IBM <span>Watson Developer Cloud</span>: Demo</h3><a href="http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/tradeoff-analytics/" class="right">Documentation</a><a href="http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/apis/#!/tradeoff-analytics" class="right">API Details</a>
                   </div>
               </div>
               <div style="padding-bottom:0px;" class="row header">
                   <div class="avatar img-container col-lg-1 col-xs-1"><img src="images/app.png">
                   </div>
                   <div class="col-lg-6 col-xs-6">
                       <h2>Tradeoff Analytics NodeJS Starter Application</h2>
                       <p>The Tradeoff Analytics service helps find the best available options for you. It helps users make better decisions under multiple conflicting goals.</p><a href="http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/tradeoff-analytics.html" class="learn-more">More about this service</a>
                   </div>
                   <div class="col-lg-4 col-xs-4 build-your-own">
                       <h3>Build your own:</h3><a href="https://bluemix.net/deploy?repository=https://github.com/watson-developer-cloud/tradeoff-analytics-java.git" class="left fork">Fork and Deploy on Bluemix</a><a href="https://github.com/watson-developer-cloud/tradeoff-analytics-java" class="right fork">Fork on Github</a>
                   </div>
               </div>
           </div>
       </div>
	<div class="row">
		<div class="col-lg-12 col-xs-12">
			<h2>Try the service</h2>
			<div class="well">
				<div class="form-group row">
					<div class="col-lg-6 col-md-6 col-xs-6">
						<label for="problems" class="control-label">Select a
							scenario to find the best options in the scenario:</label><select
							id="problems" class="problems form-control"><option
								value="phones.json">Phones</option>
							<option value="finance.json">Finance</option>
							<option value="treatments-selection.json">Treatments-selection</option>
							<option value="drug-candidates.json">Drug-candidates</option></select>
					</div>
					<div class="col-lg-6 col-md-6 col-xs-6 text-right">
						<input style="display: none;" type="button"
							value="Analyze Sample Data" class="analyze btn"><span
							class="loading"><img src="images/loading.gif"
							title="processing..."><span style="margin-left: 5px">Loading...</span></span>
					</div>
					<div class="col-lg-6 col-md-6 col-xs-6 text-right" style="height:1em"></div>
					<div id="advancedLink" class="col-lg-6 col-md-6 col-xs-6 text-right"> <a style="cursor: pointer">Advanced</a> </div>
				</div>
				<div class="form-group row">
					<div style="display: none;" class="col-lg-12 problemArea">
						<textarea class="problemText"></textarea>
					</div>
					<div class="col-lg-12 tableArea">
						<label>The list of options to analyze:</label>
						<div id="tablePlaceHolder"></div>
						<div style="margin: 10px;">
							<div>
								<span class="legendIcon legendIconEmpty"></span><span>Pre-selected
									objectives that the service will compare upon clicking
									Analyze.</span>
							</div>
							<div>
								<span class="legendIcon legendIconMax"></span><span>An
									objective that will be maximized.</span>
							</div>
							<div>
								<span class="legendIcon legendIconMin"></span><span>An
									objective that will be minimized.</span>
							</div>
						</div>
					</div>
					<div class="col-lg-12 text-right">
						<a class="viewTable">View / Edit JSON</a>
					</div>
				</div>
				<div class="form-group row">
					<label for="advance" class="col-lg-12 control-label">Advanced
						customization?</label>
					<div class="col-lg-12">
						<select id="advance" class="showAdvance form-control"><option
								value="no">No</option>
							<option value="yes">Yes</option></select>
					</div>
				</div>
				<div style="display: none;" class="form-group row advancedArea">
					<div class="col-lg-12 col-xs-12">
						<div class="form-group row">
							<div class="col-lg-12">
								<label class="control-label">Customize features:</label><a
									href="http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/tradeoff-analytics/#usingProfiles"
									target="blank"><img alt="information"
									src="images/info.png" class="informationIcon"></a>
								<p>There are two types of profiles: Basic and Advanced.
									Based on your users' needs, you can select one of the profiles
									or create your own by selecting Custom.</p>
							</div>
						</div>
						<div class="form-group row">
							<label for="profiles" class="col-lg-12 control-label">Select
								a profile:</label>
							<div class="col-lg-12">
								<select id="profiles" class="profiles form-control"><option
										value="basic">Basic (default)</option>
									<option value="advanced">Advanced</option>
									<option value="custom">Custom</option></select>
							</div>
						</div>
						<div class="form-group row">
							<div class="col-lg-12 advanceEditArea">
								<textarea id="featuresText" readonly class="featuresText"></textarea>
							</div>
						</div>
						<div class="form-group row">
							<label class="col-lg-12 control-label">Customize widget
								style:<a
								href="http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/tradeoff-analytics/#usingThemes"
								target="blank"><img alt="information" src="images/info.png"
									class="informationIcon"></a>
							</label>
							<p class="col-lg-12">You can change the overall look and
								feel of your widget's interface.</p>
						</div>
						<div class="form-group row">
							<label for="themes" class="col-lg-12 control-label">Select
								a theme:</label>
							<div class="col-lg-12">
								<select id="themes" class="themes form-control"><option
										value="watson">Watson (default)</option>
									<option value="teal">Teal</option>
									<option value="dark">Dark</option></select>
							</div>
						</div>
						<div class="form-group row">
							<div id="themeArea" class="col-lg-12 advanceEditArea">
								<textarea id="themeText" readonly></textarea>
							</div>
						</div>
					</div>
				</div>
				<div class="row">
					<div
						class="col-lg-6 col-lg-push-6 col-md-push-6 col-md-6 col-xs-6 col-xs-push-6 text-right">
						<input style="display: none;" type="button"
							value="Analyze Sample Data" class="analyze btn"><span
							class="loading"><img src="images/loading.gif"
							title="processing..."><span style="margin-left: 5px">Loading...</span></span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div style="display: none;" class="row errorArea">
		<div class="col-lg-12 col-xs-12">
			<h2>Oops, something went wrong...</h2>
			<div class="well">
				<div class="row">
					<div class="col-lg-12 col-xs-12">
						<div>
							<p class="errorMsg"></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="row viz result">
		<div class="col-lg-12 col-xs-12">
			<h2>Explore the tool</h2>
			<div class="row">
				<div class="col-lg-12 col-xs-12 text-right" style="padding-right: 0px;">
					<img id="maximize" src="images/maximize.png" class="resizeIcon"/>
				</div>
				<div id="minimizeBar" class="text-right fullscreen" style="display:none;">
					<div id="visibleMinimizeBar">
						<img id="minimize" src="images/minimize.png" class="resizeIcon"/>
					 </div>
				</div>
				<div id="taWidgetContainer" class="col-lg-12 col-xs-12"></div>
			</div>
		</div>
		<div style="display: none; margin-bottom: 30px"
			class="col-lg-12 col-xs-12 decisionArea">
			<h2>And the decision is...</h2>
			<h3 class="decisionText"></h3>
		</div>
	</div>
</div>
<script type="text/javascript" src="js/jquery-1.11.1.min.js"></script>
<script type="text/javascript" src="https://ta-cdn.mybluemix.net/v1/TradeoffAnalytics.js"></script>
<script src="js/index.js"></script>
</body>
</html>
