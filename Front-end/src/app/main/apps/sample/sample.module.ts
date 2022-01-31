import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FuseSharedModule } from '@fuse/shared.module';

import { SampleComponent } from 'app/main/apps/sample/sample.component';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: '**',
        component: SampleComponent,
    }
];

@NgModule({
    declarations: [
        SampleComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        TranslateModule,
        CommonModule,
        FuseSharedModule
    ],
    exports: [
        SampleComponent
    ]
})

export class SampleModule {
}
