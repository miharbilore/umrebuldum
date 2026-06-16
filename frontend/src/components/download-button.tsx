export function DownloadButton({ tourId, tourTitle }: { tourId: string | number; tourTitle: string }) {
    return (
        <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md font-semibold">
            Programı İndir
        </button>
    );
}
