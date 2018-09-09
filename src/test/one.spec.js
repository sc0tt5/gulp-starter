describe('Hello world 1', () => {
	beforeEach(() => {
		spyOn(window, 'helloWorldOne').and.callThrough();
		window.helloWorldOne('Hello world 1!!!');
	});

	it('says hello', () => {
		expect(window.helloWorldOne).toHaveBeenCalled();
		expect(window.helloWorldOne).toHaveBeenCalledWith('Hello world 1!!!');
	});
});
