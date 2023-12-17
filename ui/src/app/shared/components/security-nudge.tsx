import * as React from 'react';
import {ReactNode} from 'react';
import {Nudge} from './nudge';

export const SecurityNudge = (props: {children: ReactNode}) => (
    <Nudge key='security-nudge'>
        <i className='fa fa-lock-open status-icon--failed' /> {props.children} <a href='https://github.com/kubeTasker/kubeTasker'>了解更多</a>
    </Nudge>
);
