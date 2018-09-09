describe('Hello world 2', () => {
	beforeEach(() => {
		spyOn(window, 'helloWorldTwo').and.callThrough();
		window.helloWorldTwo('Hello world 2!!!');
	});

	it('says hello', () => {
		expect(window.helloWorldTwo).toHaveBeenCalled();
		expect(window.helloWorldTwo).toHaveBeenCalledWith('Hello world 2!!!');
	});
});
