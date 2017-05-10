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
	var delFileName = "",
		index, buttonClick;
	var alertFileName = false;
        var folderPath = "";
    var writeOptions = {
			path : '/',
			secure : true
	};
	var langResource =null;
	var _this =null;
	$(document).ready(function() {
		$("[data-localize]").localize("static/lang/installationUI", { language: navigator.language });
		_this=this;
		$('#example').DataTable({
			ajax: {
				url: "queryConfig",
				type: "GET",
				dataType: "JSON",
				contentType: "application/json",
				dataSrc: ''
			},
			bFilter: false,
			bLengthChange: false,
			ordering: false,
			columns: [{
					data: null,
					title: 'Check'
				}, {
					data: 'configFileName',
					title: 'File Name'
				},
				{
					data: null,
					title: 'Management URL'
				},
				{
					data: 'createTime',
					title: 'Create Time'
				},
				{
					data: 'traf_start',
					title: 'Auto Start'
				},
				{
					data: 'dcs_ha',
					title: 'DCS HA'
				},
				{
					data: 'offline_mode',
					title: 'Offline Install'
				},
				{
					data: 'ldap_security',
					title: 'LDAP Security'
				},
				{
					data: 'configFileName',
					title: 'Operation'
				}
			],
			"aoColumnDefs": [{
                                        "sWidth": "40px",
					"aTargets": [0],
					"mData": 0,
					"mRender": function(data, type, full) {
						return '<input type="radio" name="checkboxDemo"value=' + full.configFileName + '>';
					}
				},
				{
                                        "sWidth": "120px",
					"aTargets": [1],
					"mData": 1,
				},
				{
                                        "sWidth": "120px",
					"aTargets": [2],
					"mData": 2,
					"mRender": function(data, type, full) {
						if(full.apacheHadoop == "apacheHadoop") {
							var rowcontent = full.node_list;
							return rowcontent;
						}
						return full.mgr_url;
					}

				},
				{
                                        "sWidth": "140px",
					"aTargets": [3],
					"mData": 3
				},
				{
				        "sWidth": "40px",
                                  	"aTargets": [4],
					"mData": 4,
					"mRender": function(data, type, full) {
						if(data == "Y") {
							var rowcontent = '<span class="label label-success">' + data + '</span>';
						} else {
							var rowcontent = '<span class="label label-warning">' + data + '<span>';
						}
						return rowcontent;
					}

				},
				{
                                        "sWidth": "40px",
					"aTargets": [5],
					"mData": 5,
					"mRender": function(data, type, full) {
						if(data == "Y") {
							var rowcontent = '<span class="label label-success">' + data + '</span>';
						} else {
							var rowcontent = '<span class="label label-warning">' + data + '<span>';
						}
						return rowcontent;
					}

				},
				{
                                        "sWidth": "40px",
					"aTargets": [6],
					"mData": 6,
					"mRender": function(data, type, full) {
						if(data == "Y") {
							var rowcontent = '<span class="label label-success">' + data + '</span>';
						} else {
							var rowcontent = '<span class="label label-warning">' + data + '<span>';
						}
						return rowcontent;
					}

				},
				{
                                        "sWidth": "40px",
					"aTargets": [7],
					"mData": 7,
					"mRender": function(data, type, full) {
						if(data == "Y") {
							var rowcontent = '<span class="label label-success">' + data + '</span>';
						} else {
							var rowcontent = '<span class="label label-warning">' + data + '<span>';
						}
						return rowcontent;
					}

				},
				{
                                        "sWidth": "120px",
					"aTargets": [8],
					"mData": 8,
					"mRender": function(data, type, full) {
						var rowcontent = '<a type="button" class="btn btn-primary btn-alert">'+langResource["Modify"]+'</a>  <button type="button" class="btn btn-danger btn-del">'+langResource["Delete"]+'</button>';
						return rowcontent;
					}
				}
			]
		});

		$('#example').on('click', '.btn-del',
			function() {
				$("#del-confirm-modal").modal('show');
				var data = $('#example').DataTable().rows(index).data()[0]; //获取行数据
				delFileName = data["configFileName"]
			});

		$('#example').on('click', '.btn-alert',
			function() {
				alertFileName = true;
				$('#myTab a:last').tab('show');
			});

		$("[name='traf_start']").bootstrapSwitch({
			onText: "Y",
			offText: "N",
		});


		$('#configForm').on('init.form.bv',
			function(e, data) {}).bootstrapValidator({
			message: 'This value is not valid',
			feedbackIcons: {
				valid: 'glyphicon glyphicon-ok',
				invalid: 'glyphicon glyphicon-remove',
				validating: 'glyphicon glyphicon-refresh'
			},
			fields: {
				configFileName: {
					selector: '#configFileName',
					validators: {
						callback: {
							message: 'Config file exists, please enter a new one',
							callback: function(value, validator) {
								var data = $('#example').DataTable().data();
								if(alertFileName == true)
									return true;
								for(var i = 0; i < data.length; i++) {
									if(data[i].configFileName == value) {
										return false;
									}
								}
								return true;
							}
						}
					}
				}
			}
		}).on('change', 'input[type="checkbox"][name="dcs_ha"]',
			function() {
				var sameAsSender = $(this).is(':checked');
				if(sameAsSender) {
					$(".dcsHa").show();
					$('#configForm').bootstrapValidator('addField', 'dcs_floating_ip', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					}).bootstrapValidator('addField', 'dcs_interface', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					}).bootstrapValidator('addField', 'dcs_backup_nodes', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					});
				} else {
					$(".dcsHa").hide();
					$('#configForm').bootstrapValidator('removeField', 'dcs_floating_ip');
					$('#configForm').bootstrapValidator('removeField', 'dcs_interface');
					$('#configForm').bootstrapValidator('removeField', 'dcs_backup_nodes');
				}
			}).on('change', 'input[type="checkbox"][name="offline_mode"]',
			function() {
				var sameAsSender = $(this).is(':checked');
				if(sameAsSender) {
					$(".offlineInstall").show();
					$('#configForm').bootstrapValidator('addField', 'local_repo_dir', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					});
				} else {
					$(".offlineInstall").hide();
					$('#configForm').bootstrapValidator('removeField', 'local_repo_dir');
				}
			}).on('change', 'input[type="checkbox"][name="ldap_security"]',
			function() {
				var sameAsSender = $(this).is(':checked');
				if(sameAsSender) {
					$(".ldap").show();
					$('#configForm').bootstrapValidator('addField', 'db_admin_user', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					}).bootstrapValidator('addField', 'db_admin_pwd', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					}).bootstrapValidator('addField', 'db_root_user', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					}).bootstrapValidator('addField', 'ldap_hosts', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					}).bootstrapValidator('addField', 'ldap_port', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					}).bootstrapValidator('addField', 'ldap_identifiers', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					}).bootstrapValidator('addField', 'ldap_encrypt', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					});
					$("#db_admin_user").val("admin");
					$("#db_admin_pwd").val("traf123");
					$("#db_root_user").val("trafodion");
					$("#ldap_port").val("389");
					$("#ldap_encrypt").val("0");
				} else {
					$(".ldap").hide();
					$('#configForm').bootstrapValidator('removeField', 'db_admin_user');
					$('#configForm').bootstrapValidator('removeField', 'db_admin_pwd');
					$('#configForm').bootstrapValidator('removeField', 'db_root_user');
					$('#configForm').bootstrapValidator('removeField', 'ldap_hosts');
					$('#configForm').bootstrapValidator('removeField', 'ldap_port');
					$('#configForm').bootstrapValidator('removeField', 'ldap_identifiers');
					$('#configForm').bootstrapValidator('removeField', 'ldap_encrypt');
					$("#db_admin_user").val("");
					$("#db_admin_pwd").val("");
					$("#db_root_user").val("");
					$("#ldap_port").val("");
					$("#ldap_encrypt").val("");
				}
			}).on('change', 'select[name="ldap_encrypt"]',
			function() {
				var sameAsSender = this.value;
				if(sameAsSender == 1 || sameAsSender == 2) {
					$('#configForm').bootstrapValidator('addField', 'ldap_certpath', {
						validators: {
							notEmpty: {
								message: 'This value is not valid'
							}
						}
					});
				} else {
					$('#configForm').bootstrapValidator('removeField', 'ldap_certpath');
				}
			}).on('success.form.bv',
			function(e) {
				e.preventDefault();
				var href = window.location.href;
				if(buttonClick == "install") {
					window.location = href + "oinstallPage";
				} else if(buttonClick == "discover") {
					window.location = href + "installPage";
				} else {
					window.location.href = href;
				}
			});

		$("#traf_user").blur(function() {
			if(this.value == "") {
				this.value = "trafodion";
			}
		});

		$("#newConfig").click(function() {
			newConfig();
		});

		$("#newInstall").click(function() {
			newInstall();
		});

                $("#folderTable").on('click','tr',function(){
                      if(this.classList.contains("folderClass")){
                          //重画表格
                          var folder = this.innerText.replace(/(^\s*)|(\s*$)/g, "");
                          var nowFolder = $("#now-folder").val();
                          $("#folderValue").val("");
                          drawFolderTable(folder,nowFolder);
                      }else if(this.classList.contains("fileClass")){
                          $("#folderValue").val("");
                          $("#folderValue").val(this.innerText.replace(/(^\s*)|(\s*$)/g, ""));
                      }else if(this.classList.contains("backClass")){
                         //返回上一级目录
                         var nowFolder = $("#now-folder").val();
                         nowFolder=nowFolder.substring(0,nowFolder.length-1);
                         nowFolder=nowFolder.substring(0,nowFolder.lastIndexOf("/"));
                         drawFolderTable("",nowFolder);
                      }
                });
 
 
                $("#chooseFile").click(function(){
                    $("#traf_package").val(folderPath+$("#folderValue").val());
             
                }); 
               
		$("#install").click(function() {
			var val = getChangeVal(document.getElementsByName("checkboxDemo"));
			if(val == "") {
                                $("#alertContent").html("Please select data");
                                $("#alert").modal('show');	
				return;
			}else{
                            $.ajax({
                                 url: "tasks",
                                 type: "GET",
                                 dataType: "json",
                                 contentType: "application/json",
                                 dataSrc: '',
                                 success: function(data) {
                                       var isInstall =true;
                                       for(var i=0;i<data.length;i++){
                                          if(data[i].name == val && data[i].status == "IN_PROGRESS") {
                                               isInstall =false;
                                               break ;
                                         }     
                                     }
                                     if(isInstall){
                                       $.ajax({
                                          url: "install",
                                          type: "POST",
                                          dataType: "json",
                                          contentType: "application/json",
                                          dataSrc: '',
                                          data: val,
                                          success: function() {
                                              var href = window.location.href;
                                              window.location = href + "installPage";
                                          }
                                     }); 
                                   }else{
                                       $("#alertContent").html(langResource['The-cluster-is-being-installed-now']);
                                       $("#alert").modal('show');
                                   }  
                                }
                           });
                        }
		});

		$("#discover").click(function() {
			var val = getChangeVal(document.getElementsByName("checkboxDemo"));
			if(val == "") {
                $("#alertContent").html(langResource['Please-select-data']);
                $("#alert").modal('show');
				return;
			}
			$.ajax({
				url: "discover",
				type: "POST",
				dataType: "json",
				contentType: "application/json",
				dataSrc: '',
				data: val,
				success: function() {
					var href = window.location.href;
					window.location = href + "installPage";
				}
			});
		});

		$("#newDiscover").click(function() {
			newDiscover();
		});

		$("#radio1").click(function() {
			$(".cdhhdp").show();
			$(".apacheHadoop").hide();
		});
 

                $("#folderBtn").click(function() {
                    var traf_package = $("#traf_package").val();
                    drawFolderTable('','');  
                });


		$("#radio2").click(function() {
			$(".apacheHadoop").show();
			$(".cdhhdp").hide();
		});

		$("#delConfig").click(function() {
			delConfig();
			$('#example').DataTable().ajax.reload();
			hideModal();
		});

		$("#new").click(function() {
			hideModal();
			$('#myTab a:last').tab('show');
		});

		$("#configTab").click(function() {
			hideModal();
		});

		$('#example tbody').on('click', 'tr',
			function() {
				index = $(this).parent().context._DT_RowIndex; //行号
				var data = $('#example').DataTable().rows(index).data()[0]; //获取行数据
				change(document.getElementsByName("checkboxDemo"), data.configFileName);
				$("#ssh_user").val(data.ssh_user);
				$("#ssh_pwd").val(data.ssh_pwd);
				if(data.apacheHadoop == "CDH_HDP") {
		                        $(".cdhhdp").show();
                                        $(".apacheHadoop").hide();
                       			document.getElementById("radio1").checked = true;
					document.getElementById("radio2").checked = false;
					$("#mgr_url").val(data.mgr_url);
					$("#mgr_user").val(data.mgr_user);
					$("#mgr_pwd").val(data.mgr_pwd);
					$("#cluster_no").val(data.cluster_no);
				} else {
                                        $(".cdhhdp").hide();
                                        $(".apacheHadoop").show();
					document.getElementById("radio1").checked = false;
					document.getElementById("radio2").checked = true;
					$("#node_list").val(data.node_list);
					$("#hadoop_home").val(data.hadoop_home);
					$("#hbase_home").val(data.hbase_home);
					$("#hive_home").val(data.hive_home);
					$("#hdfs_user").val(data.hdfs_user);
					$("#hbase_user").val(data.hbase_user);
					$("#first_rsnode").val(data.first_rsnode);
				}
				$("#configFileName").val(data.configFileName);
				$("#configFileName").attr("readonly", true);
				$("#license_file").val(data.license_file);
				$("#traf_user").val(data.traf_user);
				$("#traf_pwd").val(data.traf_pwd);
				$("#home_dir").val(data.home_dir);
				$("#traf_dirname").val(data.traf_dirname);
				$("#traf_package").val(data.traf_package);
				$("#dcs_cnt_per_node").val(data.dcs_cnt_per_node);
				$("#scratch_locs").val(data.scratch_locs);
				$("#cgroups_cpu_pct").val(data.cgroups_cpu_pct);
				$("#cgroups_mem_pct").val(data.cgroups_mem_pct);
				$("#kdc_server").val(data.kdc_server);
				$("#kdcadmin_pwd").val(data.kdcadmin_pwd);
				$("#admin_principal").val(data.admin_principal);
				if(data.traf_start == "N") {
					$('#traf_start').bootstrapSwitch('toggleState');
					$('#toggle-state-switch').bootstrapSwitch('setState', false);
				}

				if(data.dcs_ha == "Y") {
					//              $("#dcs_ha").attr("checked", true);
					document.getElementById("dcs_ha").checked = true;
					$(".dcsHa").show();
					$("#dcs_interface").val(data.dcs_interface);
					$("#dcs_backup_nodes").val(data.dcs_backup_nodes);
					$("#dcs_floating_ip").val(data.dcs_floating_ip);
				}

				if(data.offline_mode == "Y") {
					//$("#offline_mode").attr("checked", true);
					document.getElementById("offline_mode").checked = true;
					$("#installDisplay").show();
					$("#data.local_repo_dir").val(data.local_repo_dir);
				}

				if(data.ldap_security == "Y") {
					document.getElementById("ldap_security").checked = true;
					$("#ldapDisplay1").show();
					$("#ldapDisplay2").show();
					$("#db_admin_user").val(data.db_admin_user);
					$("#db_admin_pwd").val(data.db_admin_pwd);
					$("#db_root_user").val(data.ldap_hosts);
					$("#ldap_port").val(data.ldap_identifiers);
					//              $("#ldap_encrypt").val(data.ldap_encrypt); 
					$("#ldap_certpath").val(data.ldap_certpath);
					$("#ldap_user").val(data.ldap_user);
					$("#ldap_pwd").val(data.ldap_pwd);
				}
			});
	});


	var newConfig = function() {
		buttonClick = "submit";
		$('#configForm').bootstrapValidator('validate');
		if($("#configForm").data('bootstrapValidator').isValid()) {
			var data = $("#configForm").serialize();
			$.ajax({
				url: "newConfig",
				type: "POST",
				data: data,
				dataType: "json",
				traditional: true
			});
		}
	}

	var newInstall = function() {
		buttonClick = "install";
		$('#configForm').bootstrapValidator('validate');
		if($("#configForm").data('bootstrapValidator').isValid()) {
			var data = $("#configForm").serialize();
			$.ajax({
				url: "newConfig",
				type: "POST",
				data: data,
				dataType: "json",
				traditional: true
			});
	                $.ajax({
                                 url: "tasks",
                                 type: "GET",
                                 dataType: "json",
                                 contentType: "application/json",
                                 dataSrc: '',
                                 success: function(data) {
                                       var isInstall =true;
                                       for(var i=0;i<data.length;i++){
                                          if(data[i].name ==$("#configFileName").val()&& data[i].status == "IN_PROGRESS") {
                                               isInstall =false;
                                               break ;
                                         }
                                     }
                                     if(isInstall){
                                       $.ajax({
                                          url: "install",
                                          type: "POST",
                                          dataType: "json",
                                          contentType: "application/json",
                                          dataSrc: '',
                                          data:$("#configFileName").val(),
                                          success: function() {
                                              var href = window.location.href;
                                              window.location = href + "installPage";
                                          }
                                     }); 
                                   }else{
                                       $("#alertContent").html(langResource['The-cluster-is-being-installed-now']);
                                       $("#alert").modal('show');
                                   }
                                }
                           });
		} else {
			alert("Verified failed");
		}
	}


	var newDiscover = function() {
		buttonClick = "discover";
		$('#configForm').bootstrapValidator('validate');
		if($("#configForm").data('bootstrapValidator').isValid()) {
			var data = $("#configForm").serialize();
			$.ajax({
				url: "newConfig",
				type: "POST",
				data: data,
				dataType: "json",
				traditional: true
			});

			$.ajax({
				url: "discover",
				type: "POST",
				dataType: "json",
				contentType: "application/json",
				dataSrc: '',
				data: $("#configFileName").val(),
			});

		} else {}
	}

	var delConfig = function() {
		$.ajax({
			url: "delConfig",
			type: "POST",
			data: 'configFileName=' + delFileName,
			dataType: "json",
			traditional: true,
		});
	}

	var hideModal = function() {
		alertFileName = false;
		document.getElementById("configForm").reset();
		$("#configForm").bootstrapValidator('resetForm');
		$("#configFileName").attr("readonly", false);
		document.getElementById("dcs_ha").checked = false;
		document.getElementById("offline_mode").checked = false;
		document.getElementById("ldap_security").checked = false;
		document.getElementById("radio1").checked = true;
		document.getElementById("radio2").checked = false;
		$(".cdhhdp").show();
		$(".apacheHadoop").hide();

		$(".dcsHa").hide();
		$(".ldap").hide();
		$(".offlineInstall").hide();
	}

	var change = function(radio_oj, aValue) { //传入一个对象
		for(var i = 0; i < radio_oj.length; i++) { //循环
			if(radio_oj[i].value == aValue) { //比较值
				radio_oj[i].checked = true; //修改选中状态
				break; //停止循环
			}
		}
	}

	var getChangeVal = function(radio_oj) { //传入一个对象
		for(var i = 0; i < radio_oj.length; i++) { //循环
			if(radio_oj[i].checked == true) { //比较值
				return radio_oj[i].value;
			}
		}
		return "";
	}


        var drawFolderTable = function(chooseFolder,nowFolder){ //传入一个对象
            $('#folderModal').modal({backdrop: 'static', keyboard: false});
            var folder=nowFolder+chooseFolder+"/";
            $.ajax({
                       url:"fileList",
                       type:"PUT",
                       dataType:"json",
                       contentType:"application/json",
                       dataSrc:'',
                       data:folder,
                       success:function(data){
                           $("#now-folder").val((folder=="/")?"":folder);
                           var dirs = data.dirs;
                           var files = data.files;
                           folderPath= data.abspath;
                           $("#folderTable").html("");
                           if($("#now-folder").val()!=""){
                               $("#folderTable").append('<tr class="backClass"><td style="cursor:default" ><i class="fa fa-folder-o" aria-hidden="true"></i>&nbsp&nbsp&nbsp&nbsp<i style="font-size:13px">..</i></td></tr>');
                           }
                           for(var i=0;i<dirs.length;i++){
                              var trHTML ='<tr class="folderClass"><td style="cursor:default" ><i class="fa fa-folder" aria-hidden="true"></i>&nbsp&nbsp&nbsp&nbsp<i style="font-size:13px">'+dirs[i]+'</i></td></tr>';
                              $("#folderTable").append(trHTML);
                           }
                           for(var i=0;i<files.length;i++){
                            var trHTML ='<tr class="fileClass"><td style="cursor:default" ><i class="fa fa-file" aria-hidden="true"></i>&nbsp&nbsp&nbsp&nbsp<i style="font-size:13px">'+files[i]+'</i></td></tr>';
                            $("#folderTable").append(trHTML);
                           }
                       }
           });
        }
        
	var Localizer = (function() {
				var localizedData = {};
				
				function Localizer() {
	
					var lng = window.navigator.userLanguage || window.navigator.language;
					$("[data-localize]").localize("installationUI", { language: lng, pathPrefix: "static/lang", fallback: "en", callback: function(data, defaultCallback){
						localizedData = data;
						langResource=data;
				        defaultCallback(data)
				    }});

					this.get = function(s) {
						if(localizedData.hasOwnProperty(s))
							return localizedData[s];
					}
				}
				return new Localizer();
			}());
}(jQuery);
