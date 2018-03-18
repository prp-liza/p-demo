//here comes the widget

var $faqDiv = $('<div id="faq-div"><span class="fa fa-question-circle"></span> Support</div>'),
$widgetDiv = $('<div id="faq-widget-div"></div>');

$faqDiv.click(function(){
	// $widgetDiv.show('slow')
	$widgetDiv.show().addClass('animated fadeInUp');
	setTimeout(function(){
		$widgetDiv.removeClass('animated').removeClass('fadeInUp');
	},400);
});

var $header = $('<div id="faq-header" class="child-top"></div>'),
$upHeader = $('<div style="text-align:center;padding-bottom:6px;position:relative;"><span id="faq-back-button" class="fa fa-arrow-left"></span><span id="faq-header-support-text">Support</span></div>');



var $closeButton = $('<span id="faq-close-button" class="fa fa-close"></span>');
$closeButton.click(function(){
	// $widgetDiv.hide('slow')
	$widgetDiv.addClass('animated fadeOutDown');
	setTimeout(function(){
		$widgetDiv.removeClass('animated').removeClass('fadeOutDown').hide();
	},400);
})

var $searchFrom = $('<form id="faq-search-form" autocomplete="off">'+
  '<div class="input-group">'+
    '<input type="text" id="faq-search" class="form-control" placeholder="Search" />'+
    '<div class="input-group-btn">'+
      '<button class="btn btn-default" type="submit">'+
        '<i class="glyphicon glyphicon-search"></i>'+
      '</button>'+
    '</div>'+
  '</div>'+
'</form>');

var $searchInput = $searchFrom.find('#faq-search');

$searchFrom.submit(function(){return false;});

$upHeader.append($closeButton);
$header.append($upHeader).append($searchFrom);

var $faqsBody = $('<div style="" class="parent"></div>');

$faqsBody.append($header);

$widgetDiv.append($faqsBody);

var $body = $('<div id="faq-body" class="scroll-auto-y child-bottom"></div>');
$faqsBody.append($body);

$searchInput.on('keyup',function(e){
	var val = $(this).val();
	console.log(val);
	$body.html(search(val));
});

$upHeader.find('#faq-back-button').click(function(){
	console.log('CLICKED')
	$body.html(search($searchInput.val()));
	$searchFrom.show();
	$(this).hide();
})

$('body').append($faqDiv).append($widgetDiv);
$body.html(search());


function displayFaq(faq){
	console.log(faq);
	$upHeader.find('#faq-back-button').show();
	$body.html('<h3>'+faq.question+'</h3>'+
			'<p>'+faq.answer+'</p>'
		);
	$searchFrom.hide();
}
function search(string){
	string = (string||'').trim().replace(/([^\w\d\s])/ig,'\\$1');
	var expression = new RegExp(string,'ig');
	var result = $("<ol></ol>");
	faqs.filter(function(faq){
		return expression.test(faq.question);
	}).forEach(function(faq){
		var li = $('<li><a style="cursor:pointer;">'+faq.question+'</a></li>');
		result.append(li);
		li.click(function(){displayFaq(faq)});
	})
	return result;
}



