@extends('layout')

@section('title', 'Sim')

@section('content')

<div class"row">
	<div class="col col-md-8">
		<div style="display:inline-block;">
			<h5> Plain text</h5>
	
			<textarea id="plainTextAssembly" rows="10" cols="50" style="resize: none;">
.symbol
  ax  4

.code 0
:sum
  clr r1
  clr r2 
  mvi #ax 
  mvr bp
:loop 
  mvi #10
  gt r1 
  jf exit
  ldx r1
  add r2
  mvr r2
  inc r1
  jmp loop
:exit
  trap #0

.data 64
  1 2 3 4 5 6 7 8 9 10
.end	 
			</textarea>
			
		</div>
		<div style="display:inline-block;">
			<h5> Object code</h5> 
	
			<textarea id="plainTextMC" rows="10" cols="50" style="resize: none;"></textarea>
			
		</div>
	</div> 
	
	<div class="btn-group col col-md-4" role="group" aria-label="..." style="max-width: 900px;">
		<br>
		
		<button type="button" class="btn" id="processBtn" onclick="atxMain()" style="margin:10px; width:230px;">Gen object code</button>
		
		<button type="button" class="btn" id="processBtn" onclick="load()" style="margin:10px; width:230px;">Load program</button>
	
		<button type="button" class="btn" id="processBtn" onclick="run()" style="margin:10px; width:230px;">1 step</button>
		
		<button type="button" class="btn" id="processBtn" onclick="runUntilStop()" style="margin:10px; width:230px;">Run until stop</button>
		
	</div>
</div>


<div class="row">
	
	<div class="col col-md-9">
		<!-- Nav tabs -->
		<ul class="nav nav-tabs" role="tablist" style="width: 900px; margin-top: 10px;">
			<li role="presentation"><a
				href="#console" aria-controls="console" role="tab" data-toggle="tab">
				Console</a></li>
			<li role="presentation" onclick="updateMemDisplay()"><a
				href="#memory" aria-controls="memory" role="tab"data-toggle="tab">
				Memory</a></li>
		</ul>
		
		<div>
		<!-- Tab panes -->
			<div class="tab-content" style="width: 900px; height: 270px;"> 
				<div role="tabpanel"
					class="tab-pane active"
					id="console">
					
					<!-- <textarea spellcheck="false" id="output" rows="10" style="resize: none; width: 100%; height: 100%;"></textarea> -->
					<div id="output" style="position: relative; padding: 5px; border: 1px inset #ccc; width: 900px; height: 250px; background-color: #ffffff; overflow: auto;">

					</div>
			
				</div>
				
				<div role="tabpanel"
					class="tab-pane"
					id="memory">
					
					<div style="position: relative; padding: 5px; border: 1px inset #ccc; width: 900px; height: 250px; background-color: #ffffff; overflow: auto;">
						<table>
						
							<?php
							for ($i = 0; $i < 10; $i++) {
							?>
							<tr>
								<?php
								for ($j = 0; $j < 10; $j++) {
								?>
								<td style="width: 90px; height: 20px; background-color:#FFFFFF; font-size: 10px;">
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
					</div>
								
				</div>
			</div>
		</div>
	</div>
	
	<div class="btn-group col col-md-3" role="group" aria-label="..." style="margin-top:20px; margin-bottom: 20px; max-width: 900px;">
	
		<!-- <button type="button" class="btn" onclick="viewMem()" style="margin:20px; width:120px;">View memory</button> -->
		
		<a href="https://www.cp.eng.chula.ac.th/~piak/project/tx/tx-v1.htm" target="_blank">
			<button type="button" class="btn" style="margin: 10px; width:120px;">About TX</button>
		</a>
	
		
	</div>
	
</div>

@section('customJS')
<script language="javascript" src="js/main.js"></script>
@endsection


@endsection
