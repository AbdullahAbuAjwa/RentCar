function checkFluency(){
      var checkbox = document.getElementById('faturaCheckbox');
      if (checkbox.checked == true){
          document.getElementById("faturabilgi").style="display: block;"
      }else if (checkbox.checked != true){
          document.getElementById("faturabilgi").style=";"
      }
}