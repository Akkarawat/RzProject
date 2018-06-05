<!DOCTYPE html>
<html lang="en">
    <head>
    	<meta name="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
    	<meta name="viewport" content="width=device-width, initial-scale=1">
        
        <title>rz</title>
        
        <!-- Bootstrap -->
    	<link href="css/bootstrap.min.css" rel="stylesheet">
    	<link href="css/rz/mystyle2.css" rel="stylesheet">
    	
    </head>
    <body>
       
        <div class="container" id="root">

			<div class="row">
				<div class="col col-md-12">
					<div style="display: inline-block;">
						<h5>RZ code</h5>
				
						<textarea id="inputCode" rows="10" cols="50" style="resize: none;"></textarea>
				
					</div>
					<div style="display: inline-block;">
						<h5>Plain text</h5>
				
						<textarea id="plainTextAssembly" rows="10" cols="50"
							style="resize: none;">
.symbol
 fp 30
 sp 29
 retval 28
 rads 27
 ax 1100
.code 0
 mov fp #3500
 mov sp #3000
 jal rads main
 trap r0 #0
; fun sum pv 0
:sum
; gnAsg :(#1 0 )
; gnAsg :(#2 0 )
; gnAsg :(#2 (+ #2 (vec ax #1 )))
st r1 @1 fp
st r2 @2 fp
st r3 @3 fp
st r4 @4 fp
add fp fp #5
st rads @0 fp
mov r1 #0
mov r2 #0
jmp L102
:L103
ld r4 @ax r1
add r3 r2 r4
mov r2 r3
add r1 r1 #1
:L102
lt r3 r1 #4
jt r3 L103
mov retval r2
jmp L101
:L101
ld rads @0 fp
sub fp fp #5
ld r4 @4 fp
ld r3 @3 fp
ld r2 @2 fp
ld r1 @1 fp
ret rads
; fun main pv 0
:main
; gnAsg :((vec ax 0 )11 )
; gnAsg :((vec ax 1 )22 )
; gnAsg :((vec ax 2 )33 )
; gnAsg :((vec ax 3 )44 )
st r1 @1 fp
st r2 @2 fp
add fp fp #3
st rads @0 fp
mov r1 #11
mov r2 #0
st r1 @ax r2
mov r1 #22
mov r2 #1
st r1 @ax r2
mov r1 #33
mov r2 #2
st r1 @ax r2
mov r1 #44
mov r2 #3
st r1 @ax r2
jal rads sum
trap r28 #1
mov r1 #10
trap r1 #2
:L104
ld rads @0 fp
sub fp fp #3
ld r2 @2 fp
ld r1 @1 fp
ret rads
.data 200
.end


						</textarea>
				
					</div>
					<div style="display: inline-block;">
						<h5>Object code</h5>
				
						<textarea id="plainTextMC" rows="10" cols="50" style="resize: none;"></textarea>
				
					</div>
				</div>
				
				<!--
				<div class="btn-group col col-md-4" role="group" aria-label="..."
					style="max-width: 900px;">
					
				</div>
				-->
			</div>
			
			
			<div class="row">
			
				<div class="col col-md-9">
					<!-- Nav tabs -->
					<ul class="nav nav-tabs" role="tablist"
						style="width: 900px; margin-top: 10px;">
						<li role="presentation"><a href="#console" aria-controls="console"
							role="tab" data-toggle="tab"> Console</a></li>
						<li role="presentation" onclick="updateMemDisplay()"><a
							href="#memory" aria-controls="memory" role="tab" data-toggle="tab">
								Memory</a></li>
					</ul>
			
					<div>
						<!-- Tab panes -->
						<div class="tab-content" style="width: 900px; height: 270px;">
							<div role="tabpanel" class="tab-pane active" id="console">
								<!--
								<textarea spellcheck="false" id="output" rows="10" style="resize: none; width: 100%; height: 100%;"></textarea>
								-->
								<div id="output" style="position: relative; padding: 5px; border: 1px inset #ccc; width: 900px; height: 250px; background-color: #ffffff; overflow: auto;"></div>
								
							</div>
			
							<div role="tabpanel" class="tab-pane" id="memory">
			
								<div
									style="position: relative; padding: 5px; border: 1px inset #ccc; width: 900px; height: 250px; background-color: #ffffff; overflow: auto;">
									<table>
			
											<?php
											for($i = 0; $i < 10; $i ++) {
												?>
										<tr>
											<?php
												for($j = 0; $j < 10; $j ++) {
													?>
											<td
												style="width: 90px; height: 20px; background-color: #FFFFFF; font-size: 10px;">
												<span id="m<?php echo 10*$i + $j; ?>"></span>
											</td>
											<?php
												}
												?>
										</tr>
										<?php
											}
											?>
									
									</table>
									
									<div class="btn-group" role="group" aria-label="..." style="background-color: #FFFFFF; position: relative; width: 700px; height: 30px; top: 5px;">
										<button id="memJump" onclick="memJump()" style="width: 200px; height: 30px;">Address (increment of 100)</button>
										<input id="memAddress" type="number" value="0" min="0" max="20000" step="100" style="width: 200px; height: 30px; left: 5px;">
									</div>
									
								</div>
								
							</div>
						</div>
					</div>
				</div>
			
				<div class="btn-group col col-md-3" role="group" aria-label="..."
					style="margin-top: 20px; margin-bottom: 20px; max-width: 900px;">
			
					<!-- <button type="button" class="btn" onclick="viewMem()" style="margin:20px; width:120px;">View memory</button> -->
			
					<button type="button" class="btn" id="processBtn" onclick="atxMain()"
						style="margin: 10px; width: 230px;">Gen object code</button>
				
					<button type="button" class="btn" id="processBtn" onclick="load()"
						style="margin: 10px; width: 230px;">Load program</button>
				
					<button type="button" class="btn" id="processBtn" onclick="run()"
						style="margin: 10px; width: 230px;">1 step</button>
				
					<button type="button" class="btn" id="processBtn"
						onclick="runUntilStop()" style="margin: 10px; width: 230px;">Run until
						stop</button>
			
					<a href="https://www.cp.eng.chula.ac.th/~piak/project/rz3/index-rz3.htm"
						target="_blank">
						<button type="button" class="btn" style="margin: 10px; width: 120px;">About Rz</button>
					</a>
			
			
				</div>
			
			</div>
			
		</div>
        
        <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	    <script src="js/jquery-3.1.1.min.js"></script>
	    <!-- Include all compiled plugins (below), or include individual files as needed -->
	    <script src="js/bootstrap.min.js"></script>
	    <script src="js/rz/main.js"></script>
	    
	    
    </body>
</html>