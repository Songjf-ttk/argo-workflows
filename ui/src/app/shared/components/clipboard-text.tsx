import {Tooltip} from 'argo-ui';
import * as React from 'react';
import {useState} from 'react';

export function ClipboardText({text}: {text: string}) {
    const [justClicked, setJustClicked] = useState(false);

    if (!text) {
        return <></>;
    }

    return (
        <>
            {text}
            &nbsp; &nbsp;
            <Tooltip content={justClicked ? '已复制' : '复制到剪切板'}>
                <a>
                    <i
                        className={'fa fa-clipboard'}
                        onClick={() => {
                            setJustClicked(true);
                            navigator.clipboard.writeText(text);
                            setTimeout(() => setJustClicked(false), 2000);
                        }}
                    />
                </a>
            </Tooltip>
        </>
    );
}
