import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ProgramAdministrationService } from 'src/app/shared/services/program-administration.service';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.css']
})
export class AttachmentComponent implements OnInit {
  flip: any;
  dataSourceRemainder: any;
  columnsToDisplay: string[];
  documentForm: FormGroup;

  constructor(   private programAdministrationService: ProgramAdministrationService,private formBuilder: FormBuilder,) { }

  ngOnInit(): void {
    this.programAdministrationService
    .getAllFileTypesInfo(1, 1)
    .subscribe((res: any) => {
      if (res != null) {
       console.log(JSON.stringify(res) );   
           this.dataSourceRemainder = new MatTableDataSource(res);
      }
    });
    this.columnsToDisplay = [
      "refType",
      "refDesc",
      "sel",
      "sizeApply",
      "maxSize",
      "pageApply",      
      "min",
      "max",
      "Del",
    ];
    this.documentForm = this.formBuilder.group({
     
      instructions: ["", Validators.required],
      minFiles: ["", Validators.required],
      maxFiles: ["", Validators.required],
      fileTypeAppl: [false],
    })
  }

  onclick = () => {
    const btn = document.getElementById("flip_content");
    const content = document.getElementById("f1_card1") as HTMLElement;
    content.classList.toggle("flip");
    this.flip = !this.flip;
  };

  cancelFlip() {
    this.flip = !this.flip;
  }

}
