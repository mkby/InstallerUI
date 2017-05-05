/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+
function($) {
	'use strict';

	var InstallResetButton = '#installResetButton',
		InstallApplyButton = '#installApplyButton',
		DiscoverApplyButton = '#discoverApplyButton',
		InstallDialog = '#installDialog',
		Form = '#form',
		SelectConfig = '#selectConfig';
	var oTable,index;
	$(document).ready(function() {
		oTable=$('#installTable').DataTable({
			ajax: {
				url: "tasks",
				type: "GET",
				dataType: "json",
				contentType: "application/json",
				dataSrc: ''
			},
			bFilter: false,
                        bLengthChange: false,
			columns: [{
					data: 'id',
					title: "Tasks",
                                        
				}, {
					data: 'name',
					title: 'Config File Name'
				},
				{
					data: 'type',
					title: "Type"
				},
				{
					data: 'process',
					title: 'Progress'
				},
				{
					data: 'starttime',
					title: 'Start Time'
				},
				{
					data: 'status',
					title: 'Status'
				},
				{
					data: null,
					title: 'Operation'
				}
			],
			"aoColumnDefs": [{
				    "sWidth": "40px",
					"aTargets": [0],
					"mData": 0,
				},
				{
					"sWidth": "120px",
					"aTargets": [1],
					"mData": 1,
				}, {
					"sWidth": "50px",
					"aTargets": [2],
					"mData": 2,
				},
				{
					"sWidth": "250px",
					"aTargets": [3],
					"mData": 3,
					"mRender": function(data, type, full) {
						if(type == 'display') {
							if(data == null) {
								data = 0;
							}
							if(full.status == "SUCCESS") {
								var rowcontent = '<div class="progress"><div class="progress-bar progress-bar-success" role="progressbar"' + 'aria-valuenow="60"aria-valuemin="0" aria-valuemax="100" style="width:' + data + '%' + ';min-width: 2em;"><span class="sr-only"></span></div></div>';
							} else if(full.status == "IN_PROGRESS") {
								var rowcontent = '<div class="progress"><div class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar"' + 'aria-valuenow="60"aria-valuemin="0" aria-valuemax="100" style="width:' + data + '%' + ';min-width: 2em;"><span class="sr-only"></span></div></div>';
							} else {
								var rowcontent = '<div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar"' + 'aria-valuenow="60"aria-valuemin="0" aria-valuemax="100" style="width:' + data + '%' + ';min-width: 2em;"><span class="sr-only"></span></div></div>';
							}
							return rowcontent;
						} else {
							return data;
						}
					}
				},
				{
					"sWidth": "130px",
					"aTargets": [4],
					"mData": 4,
				},
				{
					"sWidth": "100px",
					"aTargets": [5],
					"mData": 5,
					"mRender": function(data, type, full) {
						if(data == "SUCCESS") {
							var rowcontent = '<span class="label label-success">' + data + '</span>';
						} else if(data == "IN_PROGRESS") {
							var rowcontent = '<span class="label label-info">' + data + '</span>';
						} else {
							var rowcontent = '<span class="label label-danger">' + data + '</span>';
						}
						return rowcontent;
					}
				},
				{
					"sWidth": "130px",
					"aTargets": [6],
					"mData": 6,
					"mRender": function(data, type, full) {
						if(full.type == "Discover") {
							if(full.status == "SUCCESS") {
								var rowcontent = '<button type="button" class="btn btn-primary btn-slave">节点信息</button>';
								return rowcontent;
							}
						}
						var rowcontent = '<button type="button" class="btn btn-primary btn-log">日志信息</button>';
                                                if(full.type=="Install"&&full.status=="ERROR"){
                                                    rowcontent += '  <button type="button" class="btn btn-primary btn-reInstall">重装</button>' 
                                                }
						return rowcontent;
					}
				}
			]
		});
		
		$(InstallResetButton).click(function() {
			resetForm();
		});

		$(InstallApplyButton).click(function() {
			install();
		});

		$(DiscoverApplyButton).click(function() {
			discover();
		});
		//init selector
		queryConfig();

		//form show function 
		//      $(InstallDialog).on('show.bs.modal', function (e) {
		//      });
		//form hide function
		//      $("#slaveDialog").on('hide.bs.modal', function (e, v) {
		//      });

		$('#installTable').on('click', '.btn-log',
			function() {
				$("#logContent").html("");
				$("#errMsg").html("");
				$("#slaveDialog").modal("show");
				var data = oTable.rows(index).data()[0]; //获取行数据
				if(data.status != "SUCCESS" && data.status != "IN_PROGRESS") {
					$(".errMsg").show();
					$("#errMsg").css("color", "red");
					$("#errMsg").html(data.stderr.replace(/\n/g, "<br>"));
				} else {
					$(".errMsg").hide();
				}
				$.ajax({
					url: "queryLog",
					type: "GET",
					dataType: "json",
					contentType: "application/json",
					traditional: true,
					data: "logPath=" + data.logfile,
					success: function(data) {
					        $("#logContent").css("color", "black");
                                        	$("#logContent").append(data.log.replace(/\n/g, "<br>"));
					},
					error: function(msg) {
						$("#logContent").css("color", "red");
						$("#logContent").append(msg.responseText);
					}
				});
			});

 
                     $('#installTable').on('click', '.btn-reInstall',
                        function() {
                               var dataAll = oTable.data();                               
                               var fileName = oTable.rows(index).data()[0].name;
                               for(var i = 0; i < dataAll.length; i++) {
                                        if(dataAll[i].name == fileName && dataAll[i].status == "IN_PROGRESS") {
                                                $("#alert").modal("show");
                                                return;
                                        }
                                }
                                var data = oTable.rows(index).data()[0].id
                                $.ajax({
                                        url: "tasks/"+data,
                                        type: "PUT",
                                        //dataType: "json",
                                        //contentType: "application/json",
                                       
                                      //  dataSrc:'',
                                        success: function(data) {
                                            $('#installTable').DataTable().ajax.reload(null, false);    
                                        }
                                });
                        });


		$("#slaveSelect").on('change', function() {
			var data = oTable.rows(index).data()[0]; //获取行数据
			var jsonList = JSON.parse(data.stdout);
			var json = jsonList[$("#slaveSelect").val()];
			var optionstring = "";
			$("#slaveTable tbody").html("");
			for(var o in json) {
				var trHTML = "<tr><td style='font-weight:normal'>" + o + "</td><td>" + json[o] + "</td></tr>";
				$("#slaveTable").append(trHTML);
			}

		});
		$('#installTable').on('click', '.btn-slave',
			function() {
				$("#checkDialog").modal("show");
				var data = oTable.rows(index).data()[0]; //获取行数据
				var jsonList = JSON.parse(data.stdout);
                                $("#tab").html("");
				var tab = ' <ul class="nav nav-tabs" role="tablist">';
				var tabContent = '<div class="tab-content style="margin-top:100px"">';
				for(var i = 0; i < jsonList.length; i++) {
					if(i == 0) {
						tab += '<li role="presentation" class="active"><a href="#' + jsonList[i].hostname.value + '" aria-controls="' + jsonList[i].hostname.value + '" role="tab" data-toggle="tab">' + jsonList[i].hostname.value + '</a></li>';
						tabContent += '<br><div role="tabpanel" class="tab-pane fade in active" id="' + jsonList[i].hostname.value + '">';
					} else {
						tab += '<li role="presentation"><a href="#' + jsonList[i].hostname.value + '" aria-controls="' + jsonList[i].hostname.value + '" role="tab" data-toggle="tab">' + jsonList[i].hostname.value + '</a></li>';
						tabContent += '<div role="tabpanel" class="tab-pane fade" id="' + jsonList[i].hostname.value + '">';
					}
					var table = '<table class="table table-striped table-condensed"><tr><th>checkDetail</th><th>value</th><th>status</th></tr>'
					for(var o in jsonList[i]) {
						table += "<tr><td style='font-weight:normal'>"+jsonList[i][o].doc+"</td><td>" + jsonList[i][o].value+ "</td>";
                                                if(jsonList[i][o].hasOwnProperty("status")){
                                                    if(jsonList[i][o].status=="OK"){
                                                        table +="<td><button type='button' id='new' class='btn btn-success btn-circle btn-small dbmgr-status-btn sm'><i class='fa fa-check'></i></button></td></tr>";
					              }else if(jsonList[i][o].status=="error"){
                                                        table +="<td><button type='button' id='new' class='btn btn-danger btn-circle btn-small dbmgr-status-btn'><i class='fa fa-times'></i></button></td></tr>";   
                                                      }else{
                                                        table +="<td><button type='button' id='new' class='btn btn-warning btn-circle btn-small dbmgr-status-btn'><i class='fa fa-warning'></i></button></td></tr>"
                                                      }
                                                 }else{
                                                         table +="<td></td></tr>";
                                                }
                                        }
					table += '</table>';
					tabContent = tabContent + table + '</div>';
				}
				tabContent += '</div>';
				tab += '</ul>';
				$("#tab").append(tab + tabContent);
			});

		$('#installTable tbody').on('click', 'tr',
			function() {
				index = $(this).parent().context._DT_RowIndex;
			});

		$("#sel_search_orderstatus").multiselect({
			includeSelectAllOption: true,
		});

		var B = setInterval(function() {
				$('#installTable').DataTable().ajax.reload(null, false);
			},
			2900);

	});

	//reset form function
	var resetForm = function() {
		document.getElementById("form").reset();
	}

	//discover function
	var discover = function() {
		var fileName = $("#selectConfig").val();
		if(fileName == "") {
			document.getElementById("myAlert").style.display = "block";
			setTimeout("document.getElementById('myAlert').style.display='none'", 1000 * 2);
			return;
		}
		$.ajax({
			url: "discover",
			type: "POST",
			dataType: "json",
			contentType: "application/json",
			dataSrc: '',
			data: fileName,
			success: function(data) {
				$('#installTable').DataTable().ajax.reload(null, false);
			}
		});
		$(InstallDialog).modal("hide");
	}

	//install function
	var install = function() {
		var fileName = $("#selectConfig").val();
		if(fileName == "") {
			document.getElementById("myAlert").style.display = "block";
			setTimeout("document.getElementById('myAlert').style.display='none'", 1000 * 2);
			return;
		}
		$.ajax({
			url: "tasks",
			type: "GET",
			dataType: "json",
			contentType: "application/json",
			dataSrc: '',
			success: function(data) {
				for(var i = 0; i < data.length; i++) {
					if(data[i].name == fileName && data[i].status == "IN_PROGRESS") {
						document.getElementById("myAlert1").style.display = "block";
						setTimeout("document.getElementById('myAlert1').style.display='none'", 1000 * 2);
						return;
					}
				}
				$.ajax({
					url: "install",
					type: "POST",
					dataType: "json",
					contentType: "application/json",
					dataSrc: '',
					data: fileName,
					success: function(data) {
						$('#installTable').DataTable().ajax.reload(null, false);
					}
				});
				$(InstallDialog).modal("hide");
			}
		});
	}


	var queryConfig = function() {
		$.ajax({
			url: "queryConfig", //后台webservice里的方法名称
			type: "GET",
			dataType: "json",
			contentType: "application/json",
			traditional: true,
			success: function(data) {
				var jsonObj = data;
				var optionstring = "";
				for(var i = 0; i < jsonObj.length; i++) {
					optionstring += "<option value=\"" + jsonObj[i].configFileName + "\" >" + jsonObj[i].configFileName + "</option>";
				}
				$(SelectConfig).html("<option value=''>请选择...</option> " + optionstring);
			}
		});
	}

}(jQuery);
