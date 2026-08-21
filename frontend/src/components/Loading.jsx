function Loading({
    message = "Processing..."
}) {

    return (
        <div className="loading">

            <div className="loading-spinner"></div>

            <p>
                {message}
            </p>

        </div>
    );
}


export default Loading;