<?php
use SebastianBergmann\CodeCoverage\Report\PHP;
?>
<!DOCTYPE html>
<html lang="en">
    <head>
    	<meta name="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
    	<meta name="viewport" content="width=device-width, initial-scale=1">
        
        <title>@yield('title')</title>
        
        <!-- Bootstrap -->
    	<link href="css/bootstrap.min.css" rel="stylesheet">
    	<link href="css/mystyle3.css" rel="stylesheet">
    	
    </head>
    <body>
       
        <div class="container" id="root">
            @yield('content')
        </div>
        
        <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	    <script src="js/jquery-3.1.1.min.js"></script>
	    <!-- Include all compiled plugins (below), or include individual files as needed -->
	    <script src="js/bootstrap.min.js"></script>
	    @yield('customJS')
	    
	    
    </body>
</html>