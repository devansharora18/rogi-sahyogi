export const SOSConfirmation = ({ 
	onConfirm,
	onCancel
  }: {
	onConfirm: () => void;
	onCancel: () => void;
  }) => (
	<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
	  <div className="bg-white rounded-lg p-6 max-w-md w-full">
		<div className="text-center">
		  <div className="text-red-500 text-6xl mb-4">🆘</div>
		  <h2 className="text-2xl font-bold mb-4">Emergency SOS</h2>
		  <p className="mb-6">
			This will alert all nearby hospitals. Continue with emergency?
		  </p>
		  <div className="flex justify-center gap-4">
			<button
			  onClick={onCancel}
			  className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
			>
			  Cancel
			</button>
			<button
			  onClick={onConfirm}
			  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
			>
			  Confirm SOS
			</button>
		  </div>
		</div>
	  </div>
	</div>
  );