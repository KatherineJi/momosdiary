/**
 * Created by Momo on 15/8/31.
 */
$(document).ready(function() {

    $("#submit").bind('click',function(){
        $.ajax({
            url: '/blog/register',
            type: 'POST',
            dataType: 'JSON',
            data: {
                'name': $("#name").val(),
                'password': $('#pwd').val(),
                'passwordRepeat': $("#pwdAgain").val(),
                'email': $("#email").val()
            },
            success: function(data){
                console.log(data);
                console.log("register post success");
                window.location.href("/blog/")
            },
            error: function(data){
                console.log(data);
                console.log("register post error");
            }
        });
    });

});
