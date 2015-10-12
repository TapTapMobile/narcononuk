new function() {

    
    globalOwlCancelHash = true;

    

    function executeOnClick(element, callback) {

        var flag = 0;
        element.addEventListener('mousedown', function() {
            flag = 0;
        }, false);
        element.addEventListener('mousemove', function() {
            flag = 1;
        }, false);
        element.addEventListener('mouseup', function(e) {
            if (flag === 0) {
                callback(e);
                return true;
            }
            else if (flag === 1) {
                
            }
        }, true);

    }

    var owl = $("#main_owl"),
        bigOwl = $('#big_owl'),
        owlHut = $('.owl-hut'),
        bigOwlAlive = false;

    var tempCounter = 0;
    $('.home-wrapper .slide').each(function() {
        $(this).attr('data-slide-id', tempCounter++);
    });

    var windowLoaded = false;
    $(window).load(function() {
        windowLoaded = true;
    });
    function onWindowLoaded(fn) {
        windowLoaded ? setTimeout(fn, 0) : $(window).load(fn);
    }

    
    new function() {

        owl.owlCarousel({
            margin: window.owlMargin ? owlMargin : 10,
            loop: true,
            autoWidth: true,
            items: 1,
            rtl: isRTL,
            URLHashListener: false,
            center: true,
            
            
            onInitialized: function() {

                $('.owl-propper').addClass('inited');

                onWindowLoaded(function() {
                    $('.own-arrow-holder-main .owl-arrow').height($('#main_owl .owl-stage').height()).css('visibility', 'visible');
                });

                $('.owl-house').css('visibility', 'visible');

                if (!$('#lightbox').length) return;

                
                $('#main_owl.owl-carousel .slide img').each(function() {
                    $(this).after('<i></i>');
                });

                
                $('#main_owl.owl-carousel .slide i').each(function() {
                    var $img = $(this).prev('img');
                    var high = $img.position().top + $img.outerHeight();
                    if (high > 389 && 411 > high) high = 400;
                    if (high > 189 && 211 > high) high = 195;
                    var wide = $img.position().left + $img.outerWidth();
                    if (wide > 389 && 411 > wide) wide = 400;
                    if (wide > 189 && 211 > wide) wide = 195;
                    if (isRTL) {                    
                        $(this).css('right', wide + 'px').css('top', high + 'px');
                    } else {                    
                        $(this).css('left', wide + 'px').css('top', high + 'px');
                    }
                    $(this).css('pointer-events', 'none');
                });

                window.move_arrows && move_arrows();

            }
        })
        .on('change.owl.carousel', function(e) {
            smallOwlCurrentSlide = e.relatedTarget.relative(e.property.value);
        });

        $.fn.owlCarousel.Constructor.Plugins.Hash.prototype.destroy();
        
        $('.own-arrow-holder-main .owl-arrow-left').on('click', function() {
            owl.trigger('prev.owl.carousel');
        });

        $('.own-arrow-holder-main .owl-arrow-right').on('click', function() {
            owl.trigger('next.owl.carousel');
        });

        if (!$('#main_owl .owl-stage').length) {
            return console.error('Cannot find main slideshow! "#main_owl .owl-stage"');
        }

        executeOnClick($('#main_owl .owl-stage')[0], function(e) {

            if (!e.target || e.target.tagName == 'DIV') return true;
            if (!$('#lightbox').length) return true;

            owlHut.css('visibility', 'hidden');

            location.hash = '#lightbox';

            var startSlide = ($(e.target).attr('data-big-slide-number') ? parseInt($(e.target).attr('data-big-slide-number')) : 0);

            var currentSlideClicked = $(e.target);
            if (!currentSlideClicked.hasClass('owl-item')) currentSlideClicked = $(e.target).parents('.owl-item');
            var thisIndex = $('#main_owl .owl-item:not(.cloned)').index(currentSlideClicked);
            if (thisIndex !== void 0 && thisIndex !== null && smallOwlCurrentSlide != thisIndex) owl.trigger('to.owl.carousel', [thisIndex, 1]);

            if (bigOwlAlive) {
                return adjustZoomedSlideshow(startSlide);
            }
            bigOwlAlive = true;

            
            
            setTimeout(function() {

                bigOwl.owlCarousel({
                     rtl: $(document).attr('dir') === 'rtl',
                    margin: 50,
                    loop: false,
                    autoWidth: true,
                    items: 1,
                    URLHashListener: false,
                    center: true,
                    responsive: false,
                })
                .on('change.owl.carousel', bigOwlCallback);

                $.fn.owlCarousel.Constructor.Plugins.Hash.prototype.destroy();

                $('.lightbox .owl-arrow-left').on('click', function() {
                    bigOwl.trigger('prev.owl.carousel');
                });

                $('.lightbox .owl-arrow-right').on('click', function() {
                    bigOwl.trigger('next.owl.carousel');
                });

                

                onWindowLoaded(function() {
                    $('.home-wrapper .lightbox').addClass('inited');
                    $('.lightbox .owl-arrow').css('visibility', 'visible');
                    adjustZoomedSlideshow(startSlide);
                });

                

                
            }, 16);

        });
    }

    var resizeTimer;

    $(window).on('resize', function() {
        if (!resizeTimer) {
            resizeTimer = setTimeout(adjustZoomedSlideshow, 300);
        }
    });

    function adjustZoomedSlideshow(gotoSlide) {
        resizeTimer = null;

        var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        
        var width = Math.floor(Math.min(1200, viewportWidth * 0.9));

        var height = Math.floor(width * 2 / 3);
        if (height > viewportHeight * 0.8) {
            
            height = Math.floor(viewportHeight * 0.8);
            width = Math.floor(height * 3 / 2);    
        }

        owlHut.width(width);

        $('.lightbox .slide').each(function() {
            $(this).width(width);
        });

        
        

        
        
if (isRTL) {
        owlHut.css('margin-right', Math.floor((viewportWidth - width) / 2)).css('width', width + 'px');
} else {
        owlHut.css('margin-left', Math.floor((viewportWidth - width) / 2)).css('width', width + 'px');
}

        
            var arrowTop = (viewportHeight - height) / 2;
            owlHut.css('marginTop', arrowTop);
            $('.lightbox .owl-arrow').css('top', arrowTop + 'px').css('bottom', arrowTop + 'px');

if (isRTL) {
            $('.lightbox .owl-arrow.owl-arrow-left').css('right',
                Math.max(0, (Math.floor((viewportWidth - width) /2) - 92)) + 'px');
            $('.lightbox .owl-arrow.owl-arrow-right').css('right',
                Math.min((viewportWidth - 62), (Math.floor((viewportWidth + width) /2) + 30)) + 'px');
} else {
            $('.lightbox .owl-arrow.owl-arrow-left').css('left',
                Math.max(0, (Math.floor((viewportWidth - width) /2) - 92)) + 'px');
            $('.lightbox .owl-arrow.owl-arrow-right').css('left',
                Math.min((viewportWidth - 62), (Math.floor((viewportWidth + width) /2) + 30)) + 'px');
}
            bigOwl.trigger('to.owl.carousel', [(gotoSlide === void 0 ? bigOwlCurrentSlide : gotoSlide), 1]);

            setTimeout(function() {
                owlHut.css('visibility', 'visible');
            }, 100);

            
            var nightOwl = bigOwl.data('owlCarousel');
            nightOwl && nightOwl.onResize && nightOwl.onResize();

        

    }

    var lightboxOn = false,
        bigOwlCurrentSlide = 0,
        smallOwlCurrentSlide = 0;

    function bigOwlCallback(e) {
        bigOwlCurrentSlide = e.relatedTarget.relative(e.property.value);
    }

    $(window).on('hashchange', function(e) {
        if (location.hash == '#home') {

            if (lightboxOn) {

                

                setTimeout(function() {

                    var containingImage = $('.slide img[data-big-slide-number="' + bigOwlCurrentSlide + '"]').eq(0);
                    if (containingImage) {

                        var currentSmallSlide = owl.find('.owl-item:not(.cloned)').eq(smallOwlCurrentSlide);
                        if (currentSmallSlide.find('img[data-big-slide-number="' + bigOwlCurrentSlide + '"]').length) {
                            

                        } else {
                            if (containingImage.parents('.slide').attr('data-slide-id') !== void 0) {
                                var idx = parseInt(containingImage.parents('.slide').attr('data-slide-id'));
                                if (idx !== void 0) owl.trigger('to.owl.carousel', [idx, 1]);
                            }
                        }
                    }
                    
                    setTimeout(function() {
                        
                        $('body').removeClass('lightbox-showing');
                    }, 15);

                    return false;

                }, 15);

            } else {
                $('body').removeClass('lightbox-showing');
            }

            lightboxOn = false;

        }
        if (location.hash == '#lightbox') {
            lightboxOn = true;
            
            $('body').addClass('lightbox-showing');
        }
    });

    $(document).ready(function() {
        $(document).on('mouseover', '.owl-house .owl-carousel .slide i', function() {
            $(this).prev('img').addClass('hovved');
        });
        $(document).on('mouseout', '.owl-house .owl-carousel .slide i', function() {
            $(this).prev('img').removeClass('hovved');
        });
    });

};