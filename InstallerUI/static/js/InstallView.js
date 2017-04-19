/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  	var InstallResetButton  = '#installResetButton',
  		InstallApplyButton  = '#installApplyButton',
  		InstallDialog       = '#installDialog',
  	 	Form 				= '#form',
  		SelectConfig		= '#selectConfig';
  	var oTable,
	    checkListTable,
	    index;
  	$(document).ready(function() {
	      	oTable=initTable();
		checkListTable=checkTable();
		$(InstallResetButton).click(function(){
		  	resetForm();
		});
		  
		$(InstallApplyButton).click(function(){
		  	install();
		});
		
		//init selector
			queryConfig();
	      
	     //form show function 
//	  	$(InstallDialog).on('show.bs.modal', function (e) {
				
//		});
	
		//form hide function
//		$("#slaveDialog").on('hide.bs.modal', function (e, v) {

//		});
		
  		
		$('#installTable').on( 'click', '.btn-log', function () {
	        	$("#slaveDialog").modal("show");
              		var data = oTable.rows(index).data()[0];//获取行数据
			if(data.status!="SUCCESS"&&data.status!="IN_PROGRESS"){
				$(".errMsg").show();
				$("#errMsg").css("color","red");
				$("#errMsg").text(data.stderr);
			}else{
				$(".errMsg").hide();
			}
			$.ajax({
           			url: "queryLog",    //后台webservice里的方法名称  
			      	type: "GET",
				dataType: "json",
			        contentType: "application/json",
			        traditional: true,
				data:"logPath="+data.logfile,
			        success: function (data) {
            				$("#logContent").html("");
					$("#logContent").append(data.log.replace(/\n/g,"<br>"));	
				}
        });
		} );


		$('#installTable tbody').on( 'click', 'tr', function () {
			index = $(this).parent().context._DT_RowIndex;
		});

		$('#checkList tbody').on( 'click', 'tr', function () {
			var index = $(this).parent().context._DT_RowIndex; //行号
			var data = checkListTable.rows(index).data()[0];//获取行数据	
			$("#hostName").html(data.hostName);
			$("#ext_interface").html(data.ext_interface);
			$("#python_ver").html(data.python_ver);
			$("#home_dir").html(data.home_dir);
			$("#pidmax").html(data.pidmax);
			$("#mem_free").html(data.mem_free);
			$("#cpu_model").html(data.cpu_model);
			$("#cpu_cores").html(data.cpu_cores);
			$("#hadoop_authentication").html(data.hadoop_authentication);
			$("#firewall_status").html(data.firewall_status);
			$("#hive").html(data.hive);
			$("#default_java").html(data.default_java);
			$("#linux").html(data.linux);
			$("#rootdisk_free").html(data.rootdisk_free);
			$("#hadoop_security_group_mapping").html(data.hadoop_security_group_mapping);
			$("#traf_status").html(data.traf_status);
			$("#arch").html(data.arch);
			$("#hbase").html(data.hbase);
			$("#mem_total").html(data.mem_total);					
                        

			$(".check-list").hide();
			$(".check-detail").show();
               } );
	

		$("#checkShow").click(function(){
                         $(".check-list").show();
                        $(".check-detail").hide();
			
			$("#hostName").html("");
			$("#ext_interface").html("");
			$("#python_ver").html("");
			$("#home_dir").html("");
			$("#pidmax").html("");
			$("#mem_free").html("");
			$("#cpu_model").html("");
			$("#cpu_cores").html("");
			$("#hadoop_authentication").html("");
			$("#firewall_status").html("");
			$("#hive").html("");
			$("#default_java").html("");
			$("#linux").html("");
			$("#rootdisk_free").html("");
			$("#hadoop_security_group_mapping").html("");
			$("#traf_status").html("");
			$("#arch").html("");
			$("#hbase").html("");
			$("#mem_total").html("");
                });

	
		 $("#checkButton").click(function(){
			checkListTable.ajax.reload();
		});


		$("#sel_search_orderstatus").multiselect({
			includeSelectAllOption: true,
		});

		var B = setInterval(function(){
                $('#installTable').DataTable().ajax.reload(null,false);
	        },3000);

	});
  
  	//reset form function
	var resetForm =function(){
	  	document.getElementById("form").reset();
	}
  
  	//install function
  	var install =function(){
	     var fileName = $("#selectConfig").val();
             if(fileName==""){
			 document.getElementById("myAlert").style.display="block";			
			 setTimeout("document.getElementById('myAlert').style.display='none'",1000*2);
//			document.getElementById("myAlert").style.display="none"; 
			return ;
		}	
		$.ajax({
		url:"install",
		type:"POST",
		dataType: "json",
                contentType: "application/json",
                dataSrc: '',
		data:fileName+".properties",
		success:function(data){
			$('#installTable').DataTable().ajax.reload(null,false);		
		}
	     });
             $(InstallDialog).modal("hide");
             
	}
  	
  	var initTable = function(){
  		var table =$('#installTable').DataTable( {
  			ajax: {
  	  		url: "tasks",
  	  		    type: "GET",  
  	 		    dataType: "json",  
  	  		    contentType: "application/json", 
  	  		    dataSrc: ''
  	  		  	},
  	  		  	bFilter:false,
  	  		  	select: 'single',
  	            columns: [{ data: 'id', title:"id" },
  	                      { data: 'process', title:'process'},
  	                      { data: 'status', title:'status'},
			      {data: null ,title:'operation'}
  	                  ],
  	            "aoColumnDefs": [ {
  	  				"aTargets": [ 0 ],
  	  				"mData": 0,
  	  				"className" : "dbmgr-nowrap"
  	  			},
  	  			{
  	  				"sWidth": "60%",
  	  				"aTargets": [ 1 ],
  	  				"mData": 1,
	  	  			"mRender": function ( data, type, full ) {
							if(type == 'display') {
									if(data==null){
										data=0;
									}
									if(full.status=="SUCCESS"){
										var rowcontent =	'<div class="progress"><div class="progress-bar progress-bar-success" role="progressbar"'+
											'aria-valuenow="60"aria-valuemin="0" aria-valuemax="100" style="width:'+data+'%'+';min-width: 2em;">'+data+'%'+
											'<span class="sr-only"></span></div></div>';
									}else if(full.status=="IN_PROGRESS"){
										var rowcontent =        '<div class="progress"><div class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar"'+
                                                                                	'aria-valuenow="60"aria-valuemin="0" aria-valuemax="100" style="width:'+data+'%'+';min-width: 2em;">'+data+'%'+
	                                                                                '<span class="sr-only"></span></div></div>';
									}else{
										var rowcontent =        '<div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar"'+
                                                                                        'aria-valuenow="60"aria-valuemin="0" aria-valuemax="100" style="width:'+data+'%'+';min-width: 2em;">'+data+'%'+
                                                                                        '<span class="sr-only"></span></div></div>';
									}
								return rowcontent;                         
	
							}else { 
								return data;
							}
						}
  	  			},
                                {
                                        "aTargets": [ 2 ],
                                        "mData": 2,
                                        "mRender": function ( data, type, full ) {
									if(data=="SUCCESS"){
										var rowcontent = '<span class="label label-success">'+data+'</span>';
									}else if(data=="IN_PROGRESS"){
										var rowcontent = '<span class="label label-info">'+data+'</span>';
									}else{
                                                                        	var rowcontent = '<span class="label label-danger">'+data+'</span>';
									}
                                                                return rowcontent;
                                                }
                                },{
                                "aTargets": [ 3 ],
                                "mData": 3,
                                "mRender": function ( data, type, full ) {
                                                        var rowcontent = '<button type="button" class="btn btn-primary btn-log">日志信息</button>';
                                                        return rowcontent;
                                                }
                        	}]
  	      } );
    	return table;
  	}
  	
  	var queryConfig =function(){
  		$.ajax({  
            url: "queryConfig",    //后台webservice里的方法名称  
            type: "GET",  
            dataType: "json",  
            contentType: "application/json",  
            traditional: true,  
            success: function (data) {  
                    var jsonObj =data;  
                    var optionstring = "";  
                    for (var i = 0; i < jsonObj.length; i++) {  
                        optionstring += "<option value=\"" + jsonObj[i].configureFileName + "\" >" + jsonObj[i].configureFileName + "</option>";  
                    }  
                    $(SelectConfig).html("<option value=''>请选择...</option> "+optionstring);  
            }  
        });            
  	}
  	

	


	 var checkTable = function(){
                var table =$('#checkList').DataTable( {
                        ajax: {
                        url: "queryCheckList",
                            type: "POST",
                            dataType: "json",
                            contentType: "application/json",
         		    data:function(d){
				var selector="";
				 $('#sel_search_orderstatus option:selected').each(function () {
               		               if(selector.length==0){
						selector=selector+$(this).val();
					}else{
						selector=selector+","+$(this).val();		
					}
	                       		});
				d.slaveList=selector;
				},
			    dataSrc:''                   
                        },
                        bFilter:false,
                        bDestory:true,
                        bAutoWidth:false,
			bPaginate: false,
                        select:'single',
                        columns: [{ data: 'hostName', title:"hostName" },
                              { data: 'firewall_status',  title:'firewall_status'},
                              { data: 'hive', title:'hive'},
                              { data: 'traf_status', title:'traf_status'}
                          ],
                    "aoColumnDefs": [ {
                                        "aTargets": [ 0 ],
                                        "mData": 0,
                                        "className" : "dbmgr-nowrap"
                                },
                                {
                                        "aTargets": [ 1 ],
                                        "mData": 1
                                },
                                {
                                        "aTargets": [ 2 ],
                                        "mData": 2
                                },{
                                        "aTargets": [ 3 ],
                                        "mData": 3,
                                }]
              } );
        return table;
        }

}(jQuery);
