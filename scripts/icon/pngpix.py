import struct, sys, zlib
def read(path):
    d=open(path,'rb').read(); i=8; idat=b''; w=h=ct=0
    while i<len(d):
        n,=struct.unpack('>I',d[i:i+4]); t=d[i+4:i+8]; c=d[i+8:i+8+n]
        if t==b'IHDR': w,h,bd,ct=struct.unpack('>IIBB',c[:10])
        if t==b'IDAT': idat+=c
        i+=12+n
    bpp={6:4,2:3}[ct]; raw=zlib.decompress(idat); rows=[]; prev=bytearray(w*bpp); p=0
    for _ in range(h):
        f=raw[p]; line=bytearray(raw[p+1:p+1+w*bpp]); p+=1+w*bpp
        for x in range(len(line)):
            a=line[x-bpp] if x>=bpp else 0; b=prev[x]; cc=prev[x-bpp] if x>=bpp else 0
            if f==1: line[x]=(line[x]+a)&255
            elif f==2: line[x]=(line[x]+b)&255
            elif f==3: line[x]=(line[x]+(a+b)//2)&255
            elif f==4:
                pa,pb,pc=abs(b-cc),abs(a-cc),abs(a+b-2*cc)
                line[x]=(line[x]+(a if pa<=pb and pa<=pc else b if pb<=pc else cc))&255
        rows.append(line); prev=line
    return w,h,bpp,rows
if __name__ == '__main__':
    w,h,bpp,rows=read(sys.argv[1])
    for (x,y) in [(0,0),(512,512),(740,434)]:
        print((x,y), tuple(rows[y][x*bpp:x*bpp+bpp]))
