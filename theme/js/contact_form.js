($)(function(){
    /* */
    var phone_format = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;
    var email_format = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    var names_format = /^[a-zA-Z \.]+$/;

    var display_form = function(event){

        event.preventDefault();
        $("#contact_us_form input").removeClass("error");
        $("#contact_us_form form")[0].reset();
        $("body").css("overflow","hidden");
        unset_message();

        $("#contact_us_form div.form_container")
            .removeClass("animated fadeOutUp")
            .css("animation-delay","200ms")
        $("#contact_us_form")
            .removeClass("animated fadeOut")
            .css("display","block")
            .addClass("animated fadeIn")
        $("#contact_us_form div.form_container")
            .addClass("animated bounceInDown")
            .one('animationend', function(){
                $(this).css("animation-delay","0ms");
                $("#contact_us_form").css("animation-delay","100ms");
            });
    }
    var hide_form = function(){

        $("#contact_us_form div.form_container")
            .removeClass("animated bounceInDown")
            .addClass("animated fadeOutUp")
        $("#contact_us_form")
            .removeClass("animated fadeIn")
            .addClass("animated fadeOut")
            .one('animationend', function(){
            $(this).css("display","none");
            $(this).css("animation-delay","0ms");
            $("body").css("overflow","auto");
        });
    }
    var set_message = function(message){
        $("#contact_us_form div.alert-warning .message_out").html(message);
        $("#contact_us_form div.alert-warning").css('display','block');
    }
    var unset_message = function(){
        $("#contact_us_form div.alert-warning .message_out").html("");
        $("#contact_us_form div.alert-warning").css('display','none');
    }
    var check_input = function(){
        var field_parent = $("#contact_us_form div.modal-body");
        var fields_list = $("#contact_us_form ul.fields");
        var fields_copy = fields_list.clone(true);
        var errors = [];

        // Operations.
        fields_list.remove();
        field_parent.prepend(fields_copy);

        setTimeout(function(){
            var name = $("#contact_us_form input[name='name']");
            var phone = $("#contact_us_form input[name='phone']");
            var email = $("#contact_us_form input[name='email']");

            // Check name.
            if(name.val().trim() == ""){
                errors.push("Name is required.");
                name.addClass("error");
            }else{
                if(!names_format.test(name.val())){
                    name.addClass("error");
                    errors.push("Name is incorrect.");
                }else{
                    var name_temp = name.val().trim();
                    console.log(name_temp.length);
                    if(name_temp.length < 5){
                        name.addClass("error");
                        errors.push("Full name is required.");
                    }else{
                        name.removeClass("error");
                    }
                }
            }

            // Check phone.
            if(phone.val().trim() == ""){
                phone.addClass("error");
                errors.push("Phone number is required.");
            }else{
                if(!phone_format.test(phone.val())){
                    phone.addClass("error");
                    errors.push("Phone number is invalid.");
                }else{
                    phone.removeClass("error");
                }
            }

            // Check email.
            if(email.val().trim() == ""){
                email.addClass("error");
                errors.push("Email is required.");
            }else{
                if(!email_format.test(email.val())){
                    email.addClass("error");
                    errors.push("Email is invalid.");
                }else{
                    email.removeClass("error");
                }
            }
        },1);
        setTimeout(function(){
            unset_message();
            if(errors.length > 0){
                if(errors.length > 1){
                    var e_message = '<div>Please correct the following:</div>';
                    e_message += '<ul>';
                    for(var i=0; i<errors.length; i++){
                        e_message += '<li>'+errors[i]+'</li>';
                    }
                    e_message += '</ul>';
                    set_message(e_message);
                }else{
                    set_message(errors[0]);
                }
            }else{
                var stamp = new Date();
                var name = $("#contact_us_form input[name='name']");
                var phone = $("#contact_us_form input[name='phone']");
                var email = $("#contact_us_form input[name='email']");
                var details = {
                        'timestamp' : stamp,
                        'name' : name.val(),
                        'tel'  : phone.val(),
                        'email': email.val()
                    }
                $.ajax({
                    type : "post",
                    url : "https://zapier.com/hooks/catch/32f0bd/",
                    data : details,
                    success : function(response) {
                        if(response.status == "success") {
                            top.location = "thankyou.html";
                        }
                        else {
                            alert("Unknown error encountered.");
                        }
                    }
                })
            }
            $("#contact_us_form input").popover({trigger:'focus'});
        },100);
    }
    $(".get-help-link").unbind().click(display_form);
    $(".mini-help-block-get-help").unbind().click(display_form);
    $("#home_cta_boxes .box").unbind().click(display_form);
    $("div.mini-live-chat-form").unbind().click(display_form);
    $("#contact_us_form [role='submit']").click(check_input);
    $("#contact_us_form [role='close']").click(hide_form);
    $("#contact_us_form input").popover({trigger:'focus'});
    $("#contact_us_form .alert-warning button ").click(unset_message);
});