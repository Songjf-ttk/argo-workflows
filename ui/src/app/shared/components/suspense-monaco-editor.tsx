import * as React from 'react';
import {MonacoEditorProps} from 'react-monaco-editor';
import MonacoEditor from 'react-monaco-editor';

import {Loading} from './loading';

// lazy load Monaco Editor as it is a gigantic component (which can be split into a separate bundle)
const LazyMonacoEditor = React.lazy(() => {
    return import(/* webpackChunkName: "react-monaco-editor" */ 'react-monaco-editor');
});

// workaround, react-monaco-editor's own default no-op seems to fail when lazy loaded, causing a crash when unmounte
const noop = () => {}; // tslint:disable-line:no-empty

export const SuspenseMonacoEditor = React.forwardRef(function InnerMonacoEditor(props: MonacoEditorProps, ref: React.MutableRefObject<MonacoEditor>) {
    return (
        <React.Suspense fallback={<Loading />}>
            <LazyMonacoEditor ref={ref} editorWillUnmount={noop} {...props} />
        </React.Suspense>
    );
});
