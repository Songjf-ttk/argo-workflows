import * as React from 'react';

export const GiveFeedbackLink = ({href}: {href: string}) => (
    <small>
        <a href={href}>
            <i className='fa fa-comment' /> 反馈
        </a>
    </small>
);
