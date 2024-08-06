import { IdentityTemplatePage } from './app.po';

describe('Identity App', function() {
  let page: IdentityTemplatePage;

  beforeEach(() => {
    page = new IdentityTemplatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
