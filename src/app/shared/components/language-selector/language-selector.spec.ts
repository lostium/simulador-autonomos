import { LanguageSelectorComponent } from './language-selector';

describe('LanguageSelectorComponent', () => {
    let component: LanguageSelectorComponent;
    let mockDocument: any;

    const createComponent = (localeId: string, pathname: string) => {
        mockDocument = {
            location: {
                pathname: pathname,
                href: ''
            }
        };
        const mockElementRef = { nativeElement: document.createElement('div') };
        component = new LanguageSelectorComponent(localeId, mockDocument, mockElementRef);
    };

    it('should create', () => {
        createComponent('es', '/');
        expect(component).toBeTruthy();
    });

    it('should initialize with correct locale based on LOCALE_ID', () => {
        createComponent('en-US', '/en/');
        expect(component.currentLocale().code).toBe('en');
    });

    it('should default to ES if locale not found', () => {
        createComponent('fr', '/');
        expect(component.currentLocale().code).toBe('es');
    });

    describe('switchLanguage', () => {
        it('should navigate to correct URL when switching from ES (root) to EN', () => {
            createComponent('es', '/simulator');
            component.switchLanguage('en');
            expect(mockDocument.location.href).toBe('/en/simulator/');
        });

        it('should navigate to correct URL when switching from EN to ES (root)', () => {
            createComponent('en', '/en/simulator');
            component.switchLanguage('es');
            expect(mockDocument.location.href).toBe('/es/simulator/');
        });

        it('should navigate to correct URL when switching from EN to CA', () => {
            createComponent('en', '/en/simulator');
            component.switchLanguage('ca');
            expect(mockDocument.location.href).toBe('/ca/simulator/');
        });

        it('should handle root path correctly when switching from ES to EN', () => {
            createComponent('es', '/');
            component.switchLanguage('en');
            expect(mockDocument.location.href).toBe('/en/');
        });

        it('should handle root path correctly when switching from EN to ES', () => {
            createComponent('en', '/en/');
            component.switchLanguage('es');
            expect(mockDocument.location.href).toBe('/es/');
        });

        it('should handle mismatch where LOCALE_ID is ES but path is /en/ (dev scenario)', () => {
            // Simulate dev environment where app loaded at /en/ but LOCALE_ID is still default 'es'
            createComponent('es', '/en/simulator');

            // User switches to Catalan
            component.switchLanguage('ca');

            // Should strip /en/ correctly regardless of LOCALE_ID being 'es'
            expect(mockDocument.location.href).toBe('/ca/simulator/');
        });

        it('should duplicate path if naive logic was used (regression test)', () => {
            // Logic validation: existing /en/ should be stripped before adding /ca/
            createComponent('es', '/en/simulator');
            component.switchLanguage('ca');
            expect(mockDocument.location.href).toBe('/ca/simulator/');
        });

        it('should work correctly from a nested path like /ca/foo/bar', () => {
            createComponent('ca', '/ca/foo/bar');
            component.switchLanguage('es');
            expect(mockDocument.location.href).toBe('/es/foo/bar/');
        });
    });
});
