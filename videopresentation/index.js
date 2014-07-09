$(function() {
    'use strict';
    var posibleSrc = null;
    var posibleSlides = null;
    var timeEps = 0.5;
    var slides = [];
    var currentSlide = 0;
    var currentVideo = document.querySelector('video');

    var incrementSlide = function(i) {
        i++;
        if (i >= slides.length)
            i = 0;
        return i;
    }

    var nextSlide = function(i) {
        return slides[incrementSlide(i)];
    }

    var isValidSlides = function(a) {
        a.forEach(function(e) {
            if (!e || e.time == undefined || ['loop', 'pause', undefined].indexOf(e.action) < 0)
                throw new Error('error');
        })
        return true;
    }

    var closeModals = function() {
        try {
            $.arcticmodal('close');
        } catch (e) {};
    }

    var modal = function(message) {
        $.arcticmodal({
            type: "html",
            content: '<div class="box-modal open-container"><div class="box-modal_close arcticmodal-close">Закрыть</div><div>' + message + '</div></div>'
        });
    }

    currentVideo.addEventListener("timeupdate", function(e) {
        console.log(currentVideo.currentTime, nextSlide(currentSlide).time);
        if ((currentVideo.currentTime + timeEps) > ((currentSlide < slides.length - 1) ? nextSlide(currentSlide).time : 99999999999)) {
            switch (slides[currentSlide].action) {
                case 'loop':
                    currentVideo.currentTime = slides[currentSlide].time;
                    break;
                case 'pause':
                default:
                    currentVideo.pause();
                    currentSlide = incrementSlide(currentSlide);
            }
        }
    }, false);

    document.getElementById("video-input").addEventListener('change', function(e) {
        var file = this.files[0];
        if (file) {
            document.getElementById("video-path").innerHTML = file.name;
            var type = file.type;
            var canPlay = currentVideo.canPlayType(type);
            canPlay = (canPlay === '' ? 'no' : canPlay);
            var message = 'Can play type "' + type + '": ' + canPlay;
            if (canPlay == 'no') {
                modal("Can't play file");
            } else {
                posibleSrc = window.URL.createObjectURL(file);
            }
        }
    }, false);

    document.getElementById("command-input").addEventListener('change', function(e) {
        var file = this.files[0];
        if (file) {
            document.getElementById("command-path").innerHTML = file.name;
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var o = JSON.parse(e.target.result);
                    if (o && (o instanceof Array) && isValidSlides(o))
                        posibleSlides = o;
                    else
                        throw new Error('error');
                } catch (e) {
                    modal("Invalid JSON");
                }
            };
            reader.onerror = function(e) {
                modal("Файл не может быть прочитан! код " + e.target.error.code);
            };
            reader.readAsText(file);
        }
    }, false);

    document.getElementById("play-but").addEventListener('click', function(e) {
        if (!posibleSrc) {
            modal("Видео не выбрано.");
            return;
        }
        if (!posibleSlides) {
            modal("Файл управления не выбран.");
            return;
        }

        currentVideo.pause();
        currentVideo.src = posibleSrc;
        slides = posibleSlides;
        closeModals();
    }, false);

    $(document).keydown(function(e) {
        if (currentVideo.src || e.keyCode==73 || e.keyCode==76) {
            switch (e.keyCode) {
                case 83: //S
                    if (currentVideo.paused) {
                        currentVideo.play();
                    } else {
                        currentVideo.pause();
                    }
                    break;
                case 39: //right
                    currentVideo.pause();
                    currentSlide = incrementSlide(currentSlide);
                    if (Math.abs(currentVideo.currentTime - slides[currentSlide].time) > timeEps)
                        currentVideo.currentTime = slides[currentSlide].time;
                    currentVideo.play();
                    break;
                case 37: //left
                    currentVideo.pause();
                    currentSlide--;
                    if (currentSlide < 0)
                        currentSlide = slides.length - 1;
                    currentVideo.currentTime = slides[currentSlide].time;
                    currentVideo.play();
                    break;
                case 76: //L
                    closeModals();
                    $('.open-container').arcticmodal();
                    break;
                case 73: //I
                    closeModals();
                    $('.info-container').arcticmodal();
                    break;
            }
        }
    });

    $('.open-container').arcticmodal();
})
