interface Scorm12API {
    LMSInitialize(parameter: string): string;
    LMSFinish(parameter: string): string;
    LMSGetValue(element: string): string;
    LMSSetValue(element: string, value: string): string;
    LMSCommit(parameter: string): string;
    LMSGetLastError(): string;
    LMSGetErrorString(errorCode: string): string;
    LMSGetDiagnostic(errorCode: string): string;
}

interface Scorm2004API {
    Initialize(parameter: string): string;
    Terminate(parameter: string): string;
    GetValue(element: string): string;
    SetValue(element: string, value: string): string;
    Commit(parameter: string): string;
    GetLastError(): string;
    GetErrorString(errorCode: string): string;
    GetDiagnostic(errorCode: string): string;
}

declare global {
    interface Window {
        API?: Scorm12API;
        API_1484_11?: Scorm2004API;
    }
}

export class ScormAdapter {
    private contentId: number;
    private startTime: number;
    private data: Record<string, string | number | boolean | object | null>;
    private initialized: boolean = false;

    constructor(contentId: number) {
        this.contentId = contentId;
        this.startTime = Date.now();
        this.data = {};
        
        console.log('ScormAdapter created at', this.startTime);

        // Expose API to window object for SCORM 1.2
        window.API = {
            LMSInitialize: this.LMSInitialize.bind(this),
            LMSFinish: this.LMSFinish.bind(this),
            LMSGetValue: this.LMSGetValue.bind(this),
            LMSSetValue: this.LMSSetValue.bind(this),
            LMSCommit: this.LMSCommit.bind(this),
            LMSGetLastError: this.LMSGetLastError.bind(this),
            LMSGetErrorString: this.LMSGetErrorString.bind(this),
            LMSGetDiagnostic: this.LMSGetDiagnostic.bind(this),
        };

        // Expose API to window object for SCORM 2004
        window.API_1484_11 = {
            Initialize: this.LMSInitialize.bind(this),
            Terminate: this.LMSFinish.bind(this),
            GetValue: this.LMSGetValue.bind(this),
            SetValue: this.LMSSetValue.bind(this),
            Commit: this.LMSCommit.bind(this),
            GetLastError: this.LMSGetLastError.bind(this),
            GetErrorString: this.LMSGetErrorString.bind(this),
            GetDiagnostic: this.LMSGetDiagnostic.bind(this),
        };
    }

    public async initialize() {
        try {
            const response = await fetch(`/scorm/api/${this.contentId}`);
            if (response.ok) {
                this.data = await response.json();
                this.initialized = true;
                console.log('SCORM Adapter initialized with data:', this.data);
            }
        } catch (error) {
            console.error('Failed to initialize SCORM data', error);
        }
    }

    // SCORM 1.2 Methods
    private LMSInitialize(parameter: string): string {
        console.log('LMSInitialize', parameter);
        return "true";
    }

    private LMSFinish(parameter: string): string {
        console.log('LMSFinish', parameter);
        this.LMSCommit("");
        return "true";
    }

    private LMSGetValue(element: string): string {
        console.log('LMSGetValue', element);
        return String(this.data[element] || "");
    }

    private LMSSetValue(element: string, value: string): string {
        console.log('LMSSetValue', element, value);
        this.data[element] = value;
        return "true";
    }

    private LMSCommit(parameter: string): string {
        console.log('LMSCommit', parameter);
        
        // Save data to server
        fetch(`/scorm/api/${this.contentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
            },
            body: JSON.stringify({ cmi: this.data })
        }).then(response => {
            if (response.ok) {
                console.log('SCORM data saved successfully');
            } else {
                console.error('Failed to save SCORM data');
            }
        });

        return "true";
    }

    private LMSGetLastError(): string {
        return "0";
    }

    private LMSGetErrorString(errorCode: string): string {
        console.log('LMSGetErrorString', errorCode);
        return "No error";
    }

    private LMSGetDiagnostic(errorCode: string): string {
        console.log('LMSGetDiagnostic', errorCode);
        return "No diagnostic";
    }
}
