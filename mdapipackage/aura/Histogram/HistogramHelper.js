({
    loadChart : function(component, event, helper) {
      
         
         var canvas = document.getElementById("myChart");
         
         if(canvas == null) {
             console.error("IOT Chart Canvas Missing ");
             return;
         }
         
         
         var data = component.get("v.data");
         var valueList = [];
         var fieldList = [];
         for(var key in data){   
             fieldList.push(key);   
             valueList.push(data[key]);
         }
         
        var myChart = component.get("v.chart");  
        
        if(myChart == null) {
        
         	var ctx = document.getElementById("myChart").getContext('2d');
      
		     myChart = new Chart(ctx, {
                     type: 'bar',
                     data: {
                         labels: fieldList,
                         datasets: [{
                             label: '# of Records',
                             backgroundColor: 'rgba(54, 162, 235, 0.2)',
                             data: valueList,
                             borderWidth: 1
                         }]
                     },
                     options: {
                         scales: {
                             yAxes: [{
                                 ticks: {
                                     beginAtZero:true
                                 }
                             }]
                         }
                     }
                 });
         
        } else {
            myChart.data.labels = fieldList;
            myChart.data.datasets.data = valueList;
    		myChart.update();
        }
          component.set("v.chart", myChart);  
     },
    handleErrors : function(errors) {
        // Configure error toast
        let toastParams = {
            title: "Error",
            message: "Unknown error", // Default error message
            type: "error"
        };
        // Pass the error message if any
        if (errors && Array.isArray(errors) && errors.length > 0) {
            toastParams.message = errors[0].message;
        }
        // Fire error toast
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams(toastParams);
        toastEvent.fire();
    }
})