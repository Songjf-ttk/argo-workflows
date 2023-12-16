import {ErrorInfo} from 'react';
import * as React from 'react';

interface Props {
    error?: Error & {response?: any};
    errorInfo?: ErrorInfo;
}

export function ErrorPanel(props: Props) {
    return (
        <div className='white-box'>
            <h3>
                <i className='fa fa-skull status-icon--failed' /> {props.error.message}
            </h3>
            <p>
                <i className='fa fa-redo' /> <a href='javascript:document.location.reload();'>重新加载此模块</a>来重试.
            </p>
            {props.error.response && (
                <>
                    {props.error.response.req && (
                        <>
                            <h5>要求</h5>
                            <pre>
                                {props.error.response.req.method} {props.error.response.req.url}
                            </pre>
                        </>
                    )}
                    <>
                        <h5>回复</h5>
                        <pre>HTTP {props.error.response.status}</pre>
                        {props.error.response.body && <pre>{JSON.stringify(props.error.response.body, null, 2)}</pre>}
                    </>
                </>
            )}
            <h5>堆栈跟踪</h5>
            <pre>{props.error.stack}</pre>
            {props.errorInfo && (
                <>
                    <h5>组件栈</h5>
                    <pre>{props.errorInfo.componentStack}</pre>
                </>
            )}
        </div>
    );
}
