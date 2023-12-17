import * as React from 'react';
import {createRef, useState} from 'react';

import {Notice} from '../../shared/components/notice';

export function CliHelp() {
    const argoSecure = document.location.protocol === 'https:';
    const argoBaseHref = document
        .getElementsByTagName('base')[0]
        .href.toString()
        .replace(document.location.protocol + '//' + document.location.host + '/', '');
    const argoToken = (
        decodeURIComponent(document.cookie)
            .split(';')
            .map(x => x.trim())
            .find(x => x.startsWith('authorization=')) || ''
    ).replace(/^authorization="?(.*?)"?$/, '$1');

    const text = `export ARGO_SERVER='${document.location.hostname}:${document.location.port || (argoSecure ? 443 : 80)}'
export ARGO_HTTP1=true
export ARGO_SECURE=${argoSecure ? 'true' : 'false'}
export ARGO_BASE_HREF=${argoBaseHref}
export ARGO_TOKEN='${argoToken}'
export ARGO_NAMESPACE=argo ;# or whatever your namespace is
export KUBECONFIG=/dev/null ;# recommended

# check it works:
argo list`;

    const [copied, setCopied] = useState(false);
    const hiddenText = createRef<HTMLTextAreaElement>();
    return (
        <>
            <Notice>
                <h4>使用 CLI 登录</h4>
                <p>开始之前下载最新的 CLI。</p>
                <div style={{fontFamily: 'monospace', whiteSpace: 'pre', margin: 20}}>{argoToken ? text.replace(argoToken, '[REDACTED]') : text}</div>
                <p></p>
                <div>
                    <button
                        className='argo-button argo-button--base-o'
                        disabled={copied}
                        onClick={() => {
                            const x = hiddenText.current;
                            x.select();
                            x.setSelectionRange(0, 99999);
                            document.execCommand('copy');
                            setCopied(true);
                        }}>
                        {copied ? (
                            <>
                                <i className='fa fa-check' /> 已复制到剪贴板
                            </>
                        ) : (
                            <>
                                <i className='fa fa-copy' /> 复制到剪切板
                            </>
                        )}
                    </button>
                </div>
            </Notice>
            <textarea ref={hiddenText} style={{width: 0, height: 0, opacity: 0}} defaultValue={text} />
        </>
    );
}
