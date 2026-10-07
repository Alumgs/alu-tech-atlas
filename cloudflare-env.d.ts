declare module 'vinext/server/fetch-handler' {
 const handler: {fetch(request:Request,env:unknown,ctx:ExecutionContext):Promise<Response>};
 export default handler;
}
