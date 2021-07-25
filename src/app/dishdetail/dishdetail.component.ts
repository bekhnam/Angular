import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Comment } from '../shared/comment';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, animate, transition, style } from '@angular/animations';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
      state('shown', style({
        transform: 'scale(1.0)',
        opacity: 1
      })),
      state('hidden', style({
        transform: 'scale(0.5)',
        opacity: 0
      })),
      transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})
export class DishdetailComponent implements OnInit {
  comment!: Comment;
  dish!: Dish;
  dishcopy!: Dish;
  errMess?: string;
  dishIds!: string[];
  prev!: string;
  next!: string;
  commentForm!: FormGroup;
  @ViewChild('cform') commentFormDirective: any;
  visibility = 'shown';

  commentErrors: {[index:string]:string} = {
    'author': '',
    'comment': ''
  };

  validationMessages: {[index:string]:{[index:string]:string}} = {
    'author': {
      'required': 'Name is required.',
      'minlength': 'Name must be at least 2 characters long.'
    },
    'comment': {
      'required': 'Comment is required.'
    }
  } 

  constructor(
    private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private cm: FormBuilder,
    @Inject('BaseURL') public BaseURL: string
  ) {
  }

  ngOnInit(): void {
    this.createForm();

    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => {
      this.visibility = 'hidden';
      return this.dishService.getDish(params['id'])}))
      .subscribe((dish) => {
        this.dish = dish;
        this.dishcopy = dish;
        this.setPrevNext(dish.id);
        this.visibility = 'shown';
      },
      errmess => this.errMess = <any>errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm(): void {
    this.commentForm = this.cm.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      rating: 5,
      comment: ['', Validators.required],
    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {return;}
    const comment = this.commentForm;
    for (const field in this.commentErrors) {
      if (this.commentErrors.hasOwnProperty(field)) {
        this.commentErrors[field] = '';
        const control = comment.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.commentErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    this.dishcopy?.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish;
        this.dishcopy = dish;
      }, errmess => {
        this.errMess = <any>errmess;
      });
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: '',
    });
    this.commentFormDirective.resetForm({
      rating: 5,
    });
  }
}
