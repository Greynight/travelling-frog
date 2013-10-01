window.onload = function()
{
    //tag cloud
    try
    {
        TagCanvas.Start('myCanvas');
    }
    catch(e)
    {
        // something went wrong, hide the canvas container
        document.getElementById('myCanvasContainer').style.display = 'none';
    }

    //login form
    $('#enter').popover(
    { 
        html : true,
        animation: true,
        placement: 'bottom',
        trigger: 'click',
        content: function() 
        {
            return $("#enter-content").html();
        }
    });

    //Sign up form
    $('#sign').popover(
    {
        html : true,
        animation: true,
        placement: 'bottom',
        trigger: 'click',
        content: function()
        {
            return $("#sign-content").html();
        }
    });

    //user login
    function sendLogin()
    {
        $.ajax(
        {
            type:'POST', 
            url: '/user/login', 
            data:$('#login-form').serialize(), 
            success: function(response) 
            {
                if (response.login == "successful")
                {
                    window.location.reload();
                }
                else if (response.login == "wrong")
                {
                    $('input#name').val("");
                    $('input#pass').val("");
                    $('#login-message').html("Name or password is wrong, please try again.");
                }
                else
                {
                    $('#login-message').html("Response from the server is wrong.");
                }
            }
        });

        return false;
    }

    //user registration
    function sendReg()
    {
        $.ajax(
        {
            type:'POST',
            url: '/user/register',
            data:$('#sign-form').serialize(),
            success: function(response)
            {
                if (response.sign == "successful")
                {
                    $('#sign').popover('hide');
                    alert("Email has been sent to your address with link to activate your account");
                }
                else if (response.sign == "wrong_mail")
                {
                    //TODO add link to restore user's password'
                    $('#sign-message').html("This e-mail already exists in the database, you could try to restore your password.");
                }
                else if (response.sign == "wrong")
                {
                    $('#sign-message').html("Following error appears while trying to send email to your address: <br>"
                        + response.error_text);
                }
                else
                {
                    $('#sign-message').html("Response from the server is wrong.");
                }
            }
        });

        return false;
    }

    $(document).on("submit", "#login-form", sendLogin);
    $(document).on("submit", "#sign-form", sendReg);

    function sendReport()
    {
        $.ajax(
        {
            type: 'POST', 
            url:  '/report/save', 
            data: 'report=' + $('#report-text').html() + '&title=' + $('#report-title').val(), 
            success: function(response) 
            {
                if (response.result == "successful")
                {
                    
                }
                else if (response.result == "wrong")
                {

                }
                else
                {
                    
                }
            }
        });

        return false;
    }

    $("#report-form").submit(sendReport);
    //$(document).on("submit", "#sign-form", sendReport);



    var photos = function()
    {
        var fileInput   = $('#file-field'),
            imgList     = $('ul#img-list'),
            imgBox      = $('#img-container'),
            filesList   = {},
            textBox     = $('#report-text'),
            id          = '';

        fileInput.bind(
        {
            change: function()
            {
                processFiles(this.files);
            }
        });

        imgBox.bind(
        {
            dragleave: function(e)
            {
                e.preventDefault();
            },
            drop: function(e)
            {
                e.preventDefault();
            },
            dragstart: function(e)
            {
                 e.originalEvent.dataTransfer.setData('Id', e.target.id);
            },
            dragend: function(e)
            {
                console.log("dragend");
                console.log(id);
            },
            dragstop: function(e)
            {
                console.log("dragstop");
                console.log(id);
            },
            dragenter: function(e)
            {
                e.preventDefault();
            },
            dragover: function(e)
            {
                e.preventDefault();
            }
        });

        textBox.bind(
        {
            dragenter: function(e)
            {
                e.preventDefault();
            },
            dragover: function(e)
            {
                e.preventDefault();
            },
            drop: function(e)
            {
                id = e.originalEvent.dataTransfer.getData('Id');
                    
                var elm = document.getElementById(id),
                    parent = elm.parentNode;

                if (!!elm)
                {
                    elm.previousSibling.style.color = "green";
                    parent.removeChild(elm);
                    sendFile(id);
                }
            },
            dragend: function(e)
            {
                console.log("dragend1");
                console.log(id);
            },
            dragstop: function(e)
            {
                console.log("dragstop1");
                console.log(id);
            }
        });

        function processFiles(files)
        {
            var MAX_WIDTH = 800,
                MAX_HEIGHT = 600;

            $.each(files, function(i, file)
            {
                //upload only pictures
                if (!file.type.match(/image.*/))
                {
                    return true;
                }

                var reader = new FileReader();

                reader.onload = function(e)
                {
                    var img = new Image();                  
                    img.id = file.name;
                    
                    img.onload = function(e)
                    {
                        var width = img.width,
                        height = img.height;

                        if (width > height)
                        {
                            if (width > MAX_WIDTH)
                            {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        }
                        else
                        {
                            if (height > MAX_HEIGHT)
                            {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }

                        canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;

                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, width, height);
                        var dataurl = canvas.toDataURL("image/jpeg", 0.9);

                        //add this image to the files list
                        filesList[img.id] = dataurl;

                        addToWaitingList(img.id, dataurl);
                    }
                    
                    img.src = e.target.result;
                }

                reader.readAsDataURL(file);
                files[i] = null;
            });
        }
        
        function addToWaitingList(name, base64file)
        {
            var li = $('<li/>');
            $('<div/>').text(name).appendTo(li);
            var img = $('<img/>').attr("draggable", "true");
            img.attr("id", name);
            //$('<div/>').addClass('progress').text('0%').appendTo(li);
            img.attr('src', base64file);
            img.attr('width', 150);
            img.appendTo(li);
            li.appendTo(imgList);
        }

        function sendFile(id)
        {
            var dataToSend = {},
                fileId = null;

            dataToSend['id'] = id;
            dataToSend['value'] = filesList[id];
            //add progress
            //send file to nodejs
            $.ajax(
            {
                type:'POST',
                url: '/photo/upload',
                data:dataToSend,
                success: function(response)
                {
                    fileId = response.file;

                    //delete file from list
                    filesList[id] = null;

                    addImgSrcToTheReport(id, fileId);
                }
            });
        }

        function createLinkToImg(imgId)
        {
            return 'http://ge.tt/api/1/files/2VYRJnm/' + imgId + '/blob?download';
        }

        function addImgSrcToTheReport(id, imgId)
        {
            var link = createLinkToImg(imgId),
                img = document.getElementById(id),
                imgToAdd =  document.createElement('img'),
                reportText = document.getElementById("report-text");

            imgToAdd.src = link;
            imgToAdd.name = id;
            reportText.insertBefore(imgToAdd, img);
            reportText.removeChild(img);
        }
    };

    photos();
};