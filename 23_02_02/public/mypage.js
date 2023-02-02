var num = 1;

function changePic(idx){
    if(idx){
        if(num == 4) return;
        num++;
    } else{
        if(num == 1) return;
        num--;
    }

    var imgTag = document.getElementById("infoimg");
    imgTag.setAttribute("src", "/public/info0" + num + ".png");
}