$(document).ready(function(){
  //Logic for fixed header
  $(document).scroll(function() {
    var scrolledAmount = $(document).scrollTop();
    var header = $('.js-header');
    if(scrolledAmount > 200){
      header.addClass('fixed');
    }else{
      header.removeClass('fixed');
    }
  })
  //Logic to Open Mobile Search
  $('.js-mobileSearchTrigger, .js-mobileSearchClose').click(function(){
    var mobileSearch = $('.js-mobileSearch');
    if(mobileSearch.hasClass('active')){
      mobileSearch.removeClass('active');
    }else{
      mobileSearch.addClass('active');
    }
  });

  //Logic for QuickAdd Product Listings
  $('.js-CollectionProductSizes button').click(function(){
    CartJS.addItem($(this).attr('data-variant-id'), 1);
  });

  $('.js-QuickAddProductSwatch').click(function(){
    var parentContainer = $(this).closest('.js-CollectionProductContainer');
    var json = parentContainer.find('.js-CollectionProductJSON').html();
    json = $.parseJSON(json);
    var image = parentContainer.find('.js-CollectionProductImage');
    var sizes = parentContainer.find('.js-CollectionProductSizes');
    var selectedColor = $(this).attr('data-color');
    var colorImageURLFound = false;
    
    //Sets Image and Size Variants
    sizes.children('button').remove();

    for(var i = 0; i < json.variants.length; i++){
      var variant = json.variants[i];
      if(variant.option1 == selectedColor && !colorImageURLFound){
        colorImageURLFound = true;
        if(variant.featured_image){
          image.attr('src', variant.featured_image.src); 
        }
      }
      if(variant.option1 == selectedColor && variant.available){
        var size = '<button class="CollectionProduct__size-variant" type="button" data-variant-id="'+variant.id+'">'+variant.option2+'</button>';
        sizes.append(size);
      }
    } 

    //Initialize CartJS add event handler for created buttons
    parentContainer.find('.js-CollectionProductSizes button').click(function(){
      CartJS.addItem($(this).attr('data-variant-id'), 1);
    });  

    //Set Selected Button as Active
    parentContainer.find('.Product__swatch').removeClass('Product__swatch--active');
    $(this).addClass('Product__swatch--active');
  });  
});
