concrete.Product = (function() {

  function Product(container) {
    var $container = this.$container = $(container);
    //var sectionId = $container.attr('data-section-id');
    this.settings = {
      enableHistoryState: $container.data('enable-history-state') || false,
    };

    // Create our selectors
    this.selectors = {
      addToCart: '[data-add-to-cart]',
      addToCartText: '#AddToCartText',
      comparePrice: '#ComparePrice',
      originalPrice: '#ProductPrice',
      onSale: '#OnSale',
      featuredImage: '#ProductPhotoImg',
      featuredImageContainer: '#ProductPhoto',
      originalSelectorId: '#productSelect',
      singleOptionSelector: '.single-option-selector',
      variantId: '[name=id]',
    };
    // Find the product json
    if (!$('#ProductJson').html()) {
      return;
    }
    this.productSingleObject = JSON.parse(document.getElementById('ProductJson').innerHTML);
    this._stringOverrides();
    this._initVariants();
  }


  Product.prototype = _.assignIn({}, Product.prototype, {

    _stringOverrides: function() {
      concrete.productStrings = concrete.productStrings || {};
      _.extend(concrete.strings, concrete.productStrings);
    },

    _initVariants: function() {
      var options = {
        $container: this.$container,
        enableHistoryState: this.settings.enableHistoryState,
        singleOptionSelector: this.selectors.singleOptionSelector,
        product: this.productSingleObject,
      };

      this.variants = new concrete.Variants(options);
      this.$container.on('variantChange', this._updateAddToCart.bind(this));
      this.$container.on('variantChange', this._updateVariantId.bind(this));
      this.$container.on('variantChange', this._updatePrices.bind(this));
      this.$container.on('variantChange', this._customActions.bind(this));

      $('.Product__option-select-color').trigger('change');
    },

    _updateAddToCart: function(evt) {
      var variant = evt.variant;
      $(this.selectors.productPrices).removeClass('hidden');

      if (variant) {
        if (variant.available) {
          $(this.selectors.addToCart).prop('disabled', false);
          $(this.selectors.addToCartText).text(concrete.strings.addToCart);
        } else {
          $(this.selectors.addToCart).prop('disabled', true);
          $(this.selectors.addToCartText).text(concrete.strings.soldOut);
        }
      } else {
        $(this.selectors.addToCart).prop('disabled', true);
        $(this.selectors.addToCartText).text(concrete.strings.unavailable);
        $(this.selectors.productPrices).addClass('hidden');
      }
    },

    _updatePrices: function(evt) {
      var variant = evt.variant;
      $(this.selectors.originalPrice).html(concrete.Currency.formatMoney(variant.price));
      if (variant.price < variant.compare_at_price) {
        $(this.selectors.onSale).removeClass('hidden')
        $(this.selectors.comparePrice).html(concrete.Currency.formatMoney(variant.compare_at_price, concrete.moneyFormat))
      } else {
        $(this.selectors.onSale).addClass('hidden');
      }
    },

    _updateVariantId: function(evt) {
      var variant = evt.variant;
      if (variant)
        $(this.selectors.variantId).val(variant.id);
    },

    _customActions: function(evt){
      var variant = evt.variant;
      var color = variant.option1;
      //Set Active Swatch
      $('.Product__swatch--active').removeClass('Product__swatch--active');
      $('.Product__swatch[data-color="'+ color +'"]').addClass('Product__swatch--active');

      //Show Correct Variant Images
      $('.js-ProductThumbsSlider .swiper-wrapper').empty();
      $('.js-ProductThumbsSliderDots').empty();
      $('.BackupSlides .swiper-slide').clone().appendTo('.js-ProductThumbsSlider .swiper-wrapper');
      $('.js-ProductThumbs img').each(function(){
        if($(this).attr('alt') != color && $(this).attr('alt').indexOf('mp4') == -1){
          $(this).parent().remove();
        }
      });

      //Video Thumbnail Logic
      $('.js-videoImage').click(function(){
        var videoUrl = $(this).prev().attr('alt');
        var videoClass = $(window).width() < 600 ? '.js-video--mobile' : '.js-video--desktop';
        var video = document.querySelector(videoClass);
        $('.js-mainPhoto').hide();
        $(videoClass).show();
        video.src = videoUrl;
        if($(window).width() < 600){
          $(this).hide();
        }
        video.play();
      });

      //Determine number of slides based on # of variant images
      var numOfSlides = $('.js-ProductThumbsSlider .swiper-slide').length;
      if(numOfSlides > 3){
        numOfSlides = 3;
      }
      console.log(numOfSlides);
      if(numOfSlides === 0){
        $('.js-ProductThumbs').addClass('hide');
        $('#ProductPhoto').show();
      }else{
        $('.js-ProductThumbs').removeClass('hide');
      }

      //Destroy Existing Slider
      if(thumbsSlider != undefined){
        thumbsSlider.destroy();
      }

      //Reinitialize Slider
      var mobileSettings = {
        direction: 'horizontal',
        slidesPerView: 1,
        loop: false,
        allowTouchMove: true,
        pagination: {
          el: '.swiper-pagination',
        }
      };
      var desktopSettings = {
        direction: 'vertical',
        slidesPerView: numOfSlides,
        loop: false,
        allowTouchMove: false,
        navigation: {
          nextEl: '.js-ProductThumbsSliderNext',
          prevEl: '.js-ProductThumbsSliderPrev',
        }
      };
      var sliderSettings = $(window).width() < 600 ? mobileSettings : desktopSettings;
      thumbsSlider = new Swiper('.js-ProductThumbsSlider', sliderSettings);        

      //Set VariantId to button
      $('.js-AddToCart').attr('data-cart-add', variant.id);
    },

    onUnload: function() {
      this.$container.off();
    }

  });

  return Product;
  // intialize self
})();
