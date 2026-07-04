from PIL import Image, ImageDraw, ImageFont

NAVY = (15, 42, 74)          # deep navy
CYAN = (38, 166, 198)        # muted cyan
TEAL = (56, 178, 172)        # soft teal
PALEBLUE = (225, 240, 248)   # pale blue panel
LIGHTGRID = (205, 220, 232)  # ledger lines
WHITE = (255, 255, 255)

def rounded(size, radius, fill):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0,0,size-1,size-1], radius=radius, fill=fill)
    return img

def draw_drop(d, cx, cy, w, h, fill, outline=None, ow=0):
    # teardrop: triangle tip on top + circle bottom
    top = (cx, cy - h/2)
    left = (cx - w/2, cy + h*0.12)
    right = (cx + w/2, cy + h*0.12)
    d.polygon([top, left, right], fill=fill)
    d.ellipse([cx - w/2, cy - h*0.12, cx + w/2, cy + h*0.55], fill=fill)
    if outline:
        pass

def make_icon(size, path):
    img = rounded(size, int(size*0.22), PALEBLUE)
    d = ImageDraw.Draw(img)
    s = size/1024.0
    # ledger / bar chart bars at bottom
    bar_w = int(70*s)
    gap = int(38*s)
    heights = [150, 250, 200, 320]
    base_y = int(760*s)
    start_x = int(300*s)
    for i,hh in enumerate(heights):
        x0 = start_x + i*(bar_w+gap)
        y0 = base_y - int(hh*s)
        col = CYAN if i%2==0 else TEAL
        d.rounded_rectangle([x0, y0, x0+bar_w, base_y], radius=int(14*s), fill=col)
    # ledger lines
    for i in range(3):
        ly = int((830+ i*46)*s)
        d.line([int(180*s), ly, int(844*s), ly], fill=LIGHTGRID, width=int(10*s))
    # water drop centered upper
    draw_drop(d, size*0.5, size*0.36, 360*s, 460*s, NAVY)
    # small highlight
    draw_drop(d, size*0.5-40*s, size*0.34, 120*s, 160*s, (52,120,170))
    img.save(path)
    print("wrote", path, size)

def make_adaptive(size, path):
    # foreground only, transparent bg, centered content (safe zone ~66%)
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    d = ImageDraw.Draw(img)
    s = size/1024.0
    draw_drop(d, size*0.5, size*0.44, 320*s, 400*s, NAVY)
    bar_w = int(60*s); gap=int(34*s)
    heights=[130,210,170,270]; base_y=int(660*s); start_x=int(340*s)
    for i,hh in enumerate(heights):
        x0=start_x+i*(bar_w+gap); y0=base_y-int(hh*s)
        col=CYAN if i%2==0 else TEAL
        d.rounded_rectangle([x0,y0,x0+bar_w,base_y],radius=int(12*s),fill=col)
    img.save(path)
    print("wrote", path, size)

def make_splash(w, h, path):
    img = Image.new("RGBA",(w,h),PALEBLUE)
    d = ImageDraw.Draw(img)
    cx=w/2; cy=h*0.40
    draw_drop(d, cx, cy, 300, 380, NAVY)
    # bars below drop
    bar_w=44; gap=26; heights=[90,150,120,190]
    base_y=int(cy+170); start_x=int(cx-((bar_w*4+gap*3)/2))
    for i,hh in enumerate(heights):
        x0=start_x+i*(bar_w+gap); y0=base_y-hh
        col=CYAN if i%2==0 else TEAL
        d.rounded_rectangle([x0,y0,x0+bar_w,base_y],radius=10,fill=col)
    # app name
    try:
        font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
    except:
        font=ImageFont.load_default()
    text="Hydrivo Water Log"
    tb=d.textbbox((0,0),text,font=font)
    tw=tb[2]-tb[0]
    d.text((cx-tw/2, cy+230), text, fill=NAVY, font=font)
    img.convert("RGB").save(path)
    print("wrote", path, w, h)

make_icon(1024, "icon.png")
make_adaptive(1024, "adaptive-icon.png")
make_icon(1024, "favicon.png")
make_splash(1284, 2778, "splash.png")
