import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { UploadRedemptionService } from 'app/modules/admin/setting/uploadredemptionexclusion/uploadredemption.service';
