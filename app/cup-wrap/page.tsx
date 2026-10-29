"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

const LOGO_URL = "/IMG_5996.jpeg";
const FACEBOOK_URL = "https://www.facebook.com/SypOnCafe";
const LOYALTY_URL = "https://syponcafe.shop/member-register";
const COFFEE_BEANS_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIoAAACPCAYAAAAlSkPXAAAZEElEQVR42u1da2xcx3X+drnkkuJDK4qiTFNUJEeRH7JsB7bTl5s4MfJy3aAo3NYqCv9IAwRFYRRok8JA+kDaBgiC1KhRBIFd1zBatPKPonFdB23g1nXtVo4fsmhZciXZelGiHiQlvpZcPnf7Y77BPTuce+/cfS95D7DY5eXu3LlzvjmvOXMmgZjqRQXLtUSjdjYV86tuoDBptZHBk4x5WFVwFBxBAgALZYAsBso6BUfC8io4tFs3SsS8rYlqSdSprRgoTQCQcsf2CoAVAJsBdNWbb7HqKU/FBKmUcukGAHkAS5b2CjFQmlOKZKs0y0cBTAGYr7eRGwOlMlKkuwr3exXAxwEsEiyLFnc6BkoDgiTvo2aqRTcAGAPQAWA7ebUI4H/5/5ZaSpXYmI2uZqo9ZisApgHMAXgLwH0A0lDB0QSAznrwMwZK44Ck0Mg8jVWPG9OqqWZsts+Uz3d/CmCkRoCTNBtDwp9x1Y6GFiyvawTCqmG0FgBc5P8L9LIKPu0slWmc+/UxJsvAzFfZqzCZOwK11jPNe68I5pwFcJoAKAD4AMBJg4HzJQDc5TvTur149dg+cO8B6K2BShsnAPqFwXoFwClek98/QwDdBuAwgPcB3MH/zdA7qqQtU+TpxUApZuAqgGcB3A4gV0WQjJKx23jPFrq+56FC9p/l964TQB/yO8cJkjkAu3yYL1VSOXZVltLsjhgoaxn4IoDdALYCuLlKUiRHJyJFcKQFgz8GoFV8dyttkx7O7nto6PZRGkEAqqfCY7IopWoqBgkAYBnAvwDYB7UAt7NK7u4cgDYAA/x8AcAe8d0UQSQlwQ4hHd6gJMoRYLLdjgqPTZrEksS8XoTwCUAJyrYdla0PwkVZdWfPwBwhPf0M0JHItzvQ7ZbKa9N//bHwqjdsKQ9iw/5+VIFQTJJ2+M0GV7g3ycBvMKBXxAMyZZ5z2EBxIJwqcsFyghjKPOpDSxN9Ky9QK/h7gqqmgyZ302DFVQpewHcSPV2jrbGNICJMu+9TC9pgSqj3EBqgi73NarDGxMbGCSLAA6RmQO0BSpli2jX9zq9k7QwXG3u6SEaq/eV+WzzFlulIjzeyCH8dwFsoZexo0SABIn2bQA2CXDk4QXxTOYtkRcvlflMVQHJRgSKTgC6QNdzUwnxklkfgFy1XBsSIOmgahi32EP3004qN3aTr9bAbTSg6Bn3OqXJvEOI4JIhRfQsNUP827E2uUjP6ha+XyZIR+nqSvo0gF+L+Vm+C6sXvLI+M7oQ4hrqa+N0h4/QHX41pA+Thrur3y/yZetjtRbRXvRp+zSvL6BKC3nJBgeJFKl5iudzxv+leznDFwL8//+gFNH2w/0h/cjwvY3vOnFokEaw7GOW36uWk9ABFRg0aYqS6kw17JNGBYptNrSwrx1Q0VMTTJ0cmM3wQtl5fpZbNWfI3D7aA3MRwDoKtdYCAcwcXVOtXrqrPDaf5/vLxvU59ilXrRsnGliK6P7pdYfWEGAnRBuLZOAmwdBOqNTCfmH0fdyxL6fY5n6DOV0NMGZvclz+C8A3+dxtG8mY1YyfoMpxoUs0GPXvknxpddFNVZL0MTxtIDlOSbZfAGS5QUBykmq0hyABihcV1yVQChaQzJK5UwIAQZQiUyc4eOZ+m1vZ3lLAs8t+fERbZEjYAueqMWND6CCAp41rZ6GivIuUklWlZAOCRNImeic7fAYjYQlyrQhp0W0BYAuZb9Pn4yIecgpqZTdDKXKOLvXtNR6b70Ot42wR196grfUWPZ1Mtc2JRlQ98kGzBMibjrN4jgZtP+xL5AUR//ikz/+2AXgeal0G9CZOQuWpVENSBNHjlIzdIsbyBo3xQ+zr/lrYnI0AFDPD+6L4/B6ZnoFKEQyjTni5Gn77X/TGqVkDJIsMmrUAeITX34facGUuGP51hZ59AsAPfADzIj28fgBf5bWXCJqPOIn2EDRVp0YASpcxI+S6y6c5MCkaaZdDVNYyZ6C5AGdjULfRhsw0y0GtLN8B4IDl94tkcLn0GFXligUkoLr5FX5+hTGfdzgeAyhe20msd6DIwfejZQaTJrB2TUUG2NoE+FoDBnCXAZK3OEv131eh0hL96Buo3F6XPVSXWqq8wP4PAHiIkvRtAO1UOzupcm6qJXPqDRQpEdoDvqcjrOcsRqifO5iLED/qJsMgVE4YPV6hMfglToJe4bl9DsC9UElVSXipEDpY2IfiXQJVj4c1S+LSDA3VXgbLxqFWf5NC/JpZ53q1tt2h/VvZ7kUCb6oO6lff8yG+n6ZUO8E+ZSgJ5wz7K7ERJIorfZ4zfhQqmtrPvi8HDNRVDrAt1XDVEi9pIWPeRRVD4RZ6ks/xGyI+8iZVy1v0uiDAUXOQ1PRGjgG2MPoJZ9XN4vcJn8/aaAVFtV9BvdU6StYnGdNZptH8Jt3d12mUD9F+abUY5zXlXbPlL3yRM94F/NeF65gIMJJzjJMcdIhrVJKepXR4mGA5SlvkfQIkSZDkLF7RhklhLTVnYlZIAZn3Ybalg2cj8LZtgu9Lxv1noXJOTvsA5QUAf17BZ/+2cK0PAvhP9mEYKgIrt3BMonab5teFMSu9k/NQmWldPrEUiDhKGw3geeEhLRtqp8uYod+n+6vpOPyDd0/DC/J9LaTvz9Bu+hb/PsR7b4YKLN5HEEsvLtMokiRRR4lSah+uIXgDeYIDnoe3222JTJm0DH6O3/1XMv2UiJUAwHfg7ex7DMAT8Hbz7aa38qijqpmhmtkKtb/4OO2om+AtPDaiPVl3GyUbUZxeImPDCttMCeOvVdxji4/00fZMmkZkLyULKAEu09P6BwKtg0z/SghI/kmos3664V8iIEfoZQ1Ssq2yHzaA1N0mSdZZmoAz9azjb8foIofNtn7LPeZ92vwRpc49bLubr73iO98C8OtUExMAvu44dg+zrdcAfJmS4xIDbC20TUboybVYJGXDGK2JBgDKKGeVS1+OwqsJYqqvgvFMOuekRdgjF6gu5G/fJQMzwqV+nVLjy8b9P4CXv9tHydBDSXCKYHxAxENOQS3sXaAk/BxUtLWb7Y+hOCLcsF5NIwDlOErL8SigOO2vYLFTFmmb5BlUuxFrc1RA1TJgXBvhDNeLh5NkbppM1wuVWRQvbM5R9S3Dy2PpgrcK3orgFd+4AGOZrrFJ00YbS0a7emuGvN+qxd00jz9ZMv532vj9mKUvr1CCSNd2nDbNCD21D6EW+AoI31pSjQnZtEBZKuG3h6FWUoHgvTua4ZNUB1l4hfJcmWNj5jGHPupK6Po3r6C4BEZDxEWayev5KQfwWITf6CIyQTNnUTxbRri7vQ6exEWoRbgx9m3GBwhH4R/F3Qm1EKnVz2dpy6xa7p+IgeIGlFEE56GYNGuxJUzSbrEOJu4mo7KGDTAr1MhLVDFZqjQdqe2wALVPvD8Z0I8txrOdbjZwSKp1ZFYmBq2SMekIv9f7dTTDVw2w5y3g7xEGp2bSMWGkHmW7o8LQ7CeQWkW8p4ve0SnaHydodwRRN9vporttGr4xhYBlDGr95AhjDFHoJ7RVQIZN+gTwyrEFdJWkacN4vlSiXXFWGN8Lzci0Wqueg8a9FxC9oNwuo99ShaR87JaoR7WtCmmkr+l4SSmqY7cAXaoZPZJaA+URwYAVlJZBPgKvFMUUnyFv2CfLBkiuRZj571AN6TaGCZyPCMpDAH5YQr930hBviW2UcNIR1CSZmsXaRbow0hvWD8Jb+DOfQyZWRylQoyOoY2z7F6HyQ/oZPNOAWynx+TfBK59VbsHgDeH16Ihmb0RjFlBh8Cl4azHXYF/s05SDW5WB1wiGy1QVQ/ycgrcKnYEKms2UqHaHBaiX4ziKG+kkolIK6R6AF7D7RID0WoD7tgqdqK2TuHfBq8WiqyEsQS0ZlKI+tGQ7b0i9GCgORmNbiOr5O/hvi/g5FJ+CYctxmYNa33EFrq4x3yXiJgf4nuQ90ihtq0aKxvAimpDqCZRBEQsJoj0+19+ma9wKlZRs0kVErzowTslhjstVei25MsbsANQenhkUV6UuxEAJpv3U00GG4aPwTzHM0/YYBnCLkCBZAcSwikqPCw+mHSrqew5e6uOsUBvL/DsHlfVWKv28EftpCrDUEyh3QeWKLsM/qSiIfoaMk3GVTmG4DkOd9BlE3wXwO/w8yvZu5ee8sCO0q6w3opVrX9wJ4P9i1RPuIoMG4yjUPtpSN1zdS71vC4t/sgTXdZUe1QC8VWctUdI0YvtK8NRsY7DUTECpdxb+Fzhz26CCXS41SJ6mQdhBO6VS9UHmKSk6CeIZ4d10Uqr0EkyVqHDUwTZbY4kSTnvJhBUEn+crYxEdjG9cJ9NcortPOXxnO4GqXeQeqBxZ8PMgvHITlZhgqygu9xkDxYEyZPwHDp7DDEE1BO/kChsdps3xIpn/pyEAbGXc5W4B2n1inDJUF51Q2y3KpRWq3plmMGjrBRRTRWThVSdwmfmDKM5nheFm62SobgC/TBB822Es9qC4slO78KBaATxIcLah/O2n+n4f1JH/zuBslJ2CXfDWfnSuyBzUiZwmLUMtsGUDnqUH3raOhCPTrtKTKoTYFdptrsQZfrYqUvWcsA0DlCAmnKJ41+U9ZwmaPPspQdPJWX0d9spD3XBPX/gBvJ2EsBiY5exqDKLb+Yz7Y68nmni7FWopv48u6m54YfW9UKmEOSEx5AyXNEtvyBUovwtVvC8lZnlk0VwiTaMGNWKbwUYpROzLXqqgm+ia7oB3rKyugz8omGqrpjRHsA063vcg1h5x7ydB9BmElaI0Sk9ZWBdAsaUfZh3046LwODJGOz1QuSEZuqjvwx5oSxNUrpvKDggbCQheGc5WeJzaKSUnGt3zSdZAiujM827x+XnY9yBfDehbp6HPHwxwO6OkVx6EVzPfhSp9FnAW9s3p6xoorrmqj1iuddKb8fuNucp8AfYEogLcgndSonQguJSGpklU9gzg8zTWZxodKKk6gMScna0h7WSxtngwoArh7be4qWmErxoDwHP8bjf7MIfwA7K30OCuFO2jt5fbKBLFBSTmMWp5hK9zzHEWnxDtZhkjeQD2JKCkI1BW6CHpmEjKoT+jCM+fiUqraIJaetVwjxOO12fhthnqmjHT9fk9m31iEK1wC4Z9zQH45+GV+cqh8ntyngfws6ji6aKNJFFKtdS1cWsz5GYoOc5ApQvIevRdUBlifmpiBtHzW17zcXvlWsxV2jKVdGcHmiWWkqwwSEqJXG61uJ0rZIrNKD1D1fLv8DagS1qA+9L9s/R6VqgCrhjPdEUAo5VSJQvvUINKxFFS8BY3E+tZokQFyUkyQ54qYaqgXqqYUagwvjxhvIOieh/sh1Lrs3pcJN1XKa1OUrJNGf/fLfqoj57Li7hHudRGsPQ2ukRJVVCauNLNUElKGXhH1EoQ3Sxm8CDd4IxFbbX6iGytKv47Qp86CRTdH51esEeAuJfueyVp0dHwXjcSJarI3A21G2/CmJ267vsIvJyP+6FqsGq6Ayq0n4E9JXErVUSU/UK6H9MoPi5X2lHVOKq2A+s8C78SD6fD82OGtAGBUAiIL6yScb1YGymdoiSIIi23cSy2QNVtMfvZWyGgfAfA9wz3vylSIVM1lCY64+x+/j0NlaV2I9R+mj6K9nn+PQD/PT23QWXZD4iB1nt5t0IlA0WRKDqWcYXqYI/FkD4PtSp9hp//MEL7f8C+fsMwpP3SJNYFUErNz9CLdYf4O3lAZLshjnci/ADquwi8tI9IH43Qt+uUKr0E8nmsDau/L9RUFJD8Jvv5l8b1HqgFyIFG93gqJVFcSa7mvk0V0SJAJEtnXWPfZkNE/oQPmKYjGp6Dwh4CjVodtMtR4uj6slcjPvc/BvxvCk1CqTKkSTmkj0H7hPBwlgQwNkPVQAljtl8G/hZEC7qNGrbCGP8+C29bRZ4A/rMyn/0JToxxqI1gTUHleD2liMq3+fo3ARINvmV4xYJbaL9MhrT3ElTO6bLRlrZPjjj2K2PYJLqK43vCjW1HcNa/K/VyQqyg+ETWDeEeR5EkWmr8j4VZki4jvGTFAXjVmyT1UwK47sY7YaiUWUozfWxcF4pPaC+V/oTGcJK2yVAz2CelurPlFtI9Qg/osKVd/fesgzTRdJQqwmznDUouV3pKGKmyqN/b/PwygsuFRqEforho8bp1j8uZAXmqlrsCbCCdeX8Ya08xt0lFWzLREKKlLl7A2lD634sxmoPbltcgehzFucFNI03qkQfRAXvxG9N11Nn3YTRH+8Fchd4BdbqpK/2FcNM1E3+LEmWRUs5V9dxjcZH1BOgF8AvNpk6SNZYmxzjYfcL19KMWuOWrJC1ua6niPCcYCqjV6W6omimbef05B5AMWFzkJ6BSJu5pNmkSBSiV0qOzHJw02+zwGbAsXy4DmRYxmatl9i8P4FUhWQo0mFegtrJegT314Uvi8ztQx85p+j0asWmogj+faUYDthYBt1egltNzUNHOLVAFbvzAt4xo+11yVD/7DQkUFqyz0XZKO92Ododvp8G8SiP0ILxkqt8OaO97nAxZAJ/ysctioIhZqaOaGYQvq09BhdBdM+nHyeBpFB/a5Fpz/gn2KwXvfMCCiHlIW0ivPX1FXP9bH6N1FWpN6hRU8O6eCqnvhgVKubv2HyjBTrgF7ucMDhCEgwKUScHwMKboXBS9YDdsAXqCoDlHUEqJIukx0YcOqAXK30f19i83FFAeqfFDboIKlN1ApoWJ67vpRuuq2FN83eQIlq/z/Vky+E7aGbcKqbZAdbiVgLxX/P6P6DGBBm+G3+D2qtPW9CCptuo5SFE9Q+anoNZQHgwYMF0MuIUSpd3xXjrWoqO51+C/fH+YUus+i9s+CuBvoI6ZHRZurDwDqJV211FKIh39/SbtKi2Z/rkOk6xq5NL5cmbEIagop1593c/BvCvEk0pEUB2SrhBs3QTlPku7+jSOUXpJE8L41ecfd0Kd3DVo2DpnCJRRAmUMwB8b9/guVC7uNrbXi3UQoq82UCDE+l4OnK5IkDfc40KJ/TsGL4VhmCBJs/0hnzbHKLHeg1dHTQcCd8E7UXTWcH0BtRdnkW3IvJTnoPbo3FzBuNOGA4rOon+Ior+H4n+/IT00s3Upz20IXrHVBx3o84lPkMHbQ/ozCrXgp2NJR/jeheKy65+B/Wg6fUztLNVea4ljG9soBi0ZtkASat1k1ee7Oxh7CFvWzwmQDLPtHh+mScDrRKXXyfRbCIidtG+2Cmm0aATgtKe0r4zJ15RAKdTgAZNiluqz+iYo5qUdMs4+nYPbttAvis99BNdqAAMLgvmDwticEv0bMq61+9hO6x4c9ZAoOdoNxwiSNp+A2Bi8Qn67S7hHHvaT0oMYvQj7CR8ZuO+jXveURPWPWH2ank4bmbJKQ9Jc7dXVDcb5v2MR79MP78AoDYAg20y/2o2/m+5M4loBpdo0RJA8YDBwD8GhVcIyQaSPQbk94n0uozilMb1RZ3+zAuUyitdteoQ0kfdP8zWJ6JuifkxDth2Vr7MWU42A0ku3WINkhobnZYs3smy4rK60hS51C8o/+SKmOgElZxiOg1DBt1mLHXIL1M7BJP//suM9VuCdfJoXNk9MTQQUTccYq+iACojtNWIRCWGU3kKATUMlEgXRG5REWcvzxPZJHdzjUrYqPCc+D8LbVmqjLNSmrX5LjCQM7F2i3XQZk6AQA6x8iaJdW01hVYeegXdErAZlRwATOlFc2cCVslDBu44KjUkMkhIlijY4e+CdAwz475v9K3grrJ3wAmthNsNVRD9V/QV4gTZ94mlLGQyPQVIhG0V+/1Gf72yHSmXczFn+q7yuGXjN53elJEfvIhB1ffyWmKXVIdcZVOraxjOUKgdEGxNYu7k8S8N1MELbrwqb5zZKlTjIVmeJYg78PNxOmei2xDWWsfYEiy5KoCgM7haeTiua5JSKjeD1SOpwsCee8rFNBlAcaFugPTNBtTTOz/c59GFQSKfOWJo0ho0iGTAMtX5zEvbj7kHjtxfAwyHt6upGQ8Jz8atCoANwpympwg6gjKnOEmUXmbqZquQQ1FHygEqq1tFYl72/g/AOnwyjHoIlRTCZKQWxNKmzMetn2GoVEtZO1lANug2dp+LqrRyiKtuDtemOMUgaUKKYoJFgOQsVONtM1bMJ/rv+0gEu8TGqxhaohOVjUGmLGajV5+0x+xo3jhI0cy8BuMjPvcJ20Keeg95Owbi/zSiephfTAy9tYIXfbcU6zXRfb6rHpoL0IUs5qIjtLLwyEbNQaY1mDqyOoso+rPDaBYLrTtgPgIxB0gQSxUafAnCcXlCaHhEoAT4Ge6J0i1AxGgAtNI6TPnGVGCRNTGZtt5egoqbTBMFFxkfkd7QKWuF7FmpPzkVKoIMh9yjEw948qidopoOqo43GbNKicubg1btfgMpS63ZoN5YkTQwUk6m2QyVd+1AIcbO7Y7Y1N1DCmG3mx2bhXuwmliLrFChRQRQDJAZKZMDEwIgppphiiimmmKphd8TBsHVIyQqDJKaYYooppphiiqkSFAe3mttxqCZPi9pPxePdlOCY8fn/MspPNrcC8P8B4l/9Qnyp8JcAAAAASUVORK5CYII=";

 type PrintRecord = { id: string; printedAt: string; cup: string; drinkName: string; price: string; category?: string; theme?: string; customerName: string; orderNumber: string; orderDateTime: string; quote: string; note: string; };
const HISTORY_KEY = "sypCupWrapPrintHistoryV1";
const ORDER_COUNTER_KEY = "sypCupWrapNextOrderNumberV1";
const STARTING_CASH_KEY = "sypCupWrapStartingCashV1";

const CUP_MENU = [
  { id: "americano-16", name: "Americano", size: "16oz", price: 69, category: "Coffee", image: "/products/iced-americano-official.webp" },
  { id: "americano-22", name: "Americano", size: "22oz", price: 79, category: "Coffee", image: "/products/iced-americano-official.webp" },
  { id: "spanish-16", name: "Spanish Latte", size: "16oz", price: 89, category: "Coffee", image: "/products/spanish-latte.webp", bestseller: true },
  { id: "spanish-22", name: "Spanish Latte", size: "22oz", price: 109, category: "Coffee", image: "/products/spanish-latte.webp", bestseller: true },
  { id: "oreo-16", name: "Oreo Latte", size: "16oz", price: 79, category: "Coffee", image: "/products/oreo-latte-corrected.webp" },
  { id: "oreo-22", name: "Oreo Latte", size: "22oz", price: 99, category: "Coffee", image: "/products/oreo-latte-corrected.webp" },
  { id: "milo-latte-16", name: "Iced Milo Latte", size: "16oz", price: 79, category: "Coffee", image: "/products/iced-milo-latte.webp" },
  { id: "milo-latte-22", name: "Iced Milo Latte", size: "22oz", price: 99, category: "Coffee", image: "/products/iced-milo-latte.webp" },
  { id: "vanilla-16", name: "Vanilla Latte", size: "16oz", price: 89, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "vanilla-22", name: "Vanilla Latte", size: "22oz", price: 109, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "french-vanilla-16", name: "French Vanilla Latte", size: "16oz", price: 89, category: "Coffee", image: "/products/french-vanilla-latte.webp" },
  { id: "french-vanilla-22", name: "French Vanilla Latte", size: "22oz", price: 109, category: "Coffee", image: "/products/french-vanilla-latte.webp" },
  { id: "almond-16", name: "Roasted Almond Latte", size: "16oz", price: 99, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "almond-22", name: "Roasted Almond Latte", size: "22oz", price: 119, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "biscoff-16", name: "Biscoff Latte", size: "16oz", price: 99, category: "Coffee", image: "/products/biscoff-latte.webp" },
  { id: "biscoff-22", name: "Biscoff Latte", size: "22oz", price: 119, category: "Coffee", image: "/products/biscoff-latte.webp" },
  { id: "salted-caramel-16", name: "Salted Caramel", size: "16oz", price: 89, category: "Coffee", image: "/products/caramel-macchiato.webp" },
  { id: "salted-caramel-22", name: "Salted Caramel", size: "22oz", price: 109, category: "Coffee", image: "/products/caramel-macchiato.webp" },

  // Hot Coffee Collection — unified official black SYP cup
  { id: "hot-americano-8", name: "Hot Americano", size: "8oz", price: 49, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-americano-12", name: "Hot Americano", size: "12oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-spanish-8", name: "Hot Spanish Latte", size: "8oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-spanish-12", name: "Hot Spanish Latte", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-oreo-8", name: "Hot Oreo Latte", size: "8oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-oreo-12", name: "Hot Oreo Latte", size: "12oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-milo-8", name: "Hot Milo Latte", size: "8oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-milo-12", name: "Hot Milo Latte", size: "12oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-mocha-8", name: "Hot Mocha", size: "8oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-mocha-12", name: "Hot Mocha", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-white-mocha-8", name: "Hot White Mocha", size: "8oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-white-mocha-12", name: "Hot White Mocha", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-almond-8", name: "Hot Roasted Almond Latte", size: "8oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-almond-12", name: "Hot Roasted Almond Latte", size: "12oz", price: 99, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-biscoff-8", name: "Hot Biscoff Latte", size: "8oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-biscoff-12", name: "Hot Biscoff Latte", size: "12oz", price: 99, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-salted-caramel-8", name: "Hot Salted Caramel", size: "8oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-salted-caramel-12", name: "Hot Salted Caramel", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },

  { id: "milo-dino-16", name: "Milo Dino", size: "16oz", price: 79, category: "Milky", image: "/products/milo-dino.webp" },
  { id: "milo-dino-22", name: "Milo Dino", size: "22oz", price: 99, category: "Milky", image: "/products/milo-dino.webp" },
  { id: "oreo-milky-16", name: "Oreo Milky", size: "16oz", price: 79, category: "Milky", image: "/products/oreo-milky.webp" },
  { id: "oreo-milky-22", name: "Oreo Milky", size: "22oz", price: 99, category: "Milky", image: "/products/oreo-milky.webp" },
  { id: "caramel-macchiato-16", name: "Caramel Macchiato", size: "16oz", price: 99, category: "Milky", image: "/products/caramel-macchiato.webp", bestseller: true },
  { id: "caramel-macchiato-22", name: "Caramel Macchiato", size: "22oz", price: 119, category: "Milky", image: "/products/caramel-macchiato.webp", bestseller: true },
  { id: "white-choco-16", name: "Milky White Choco", size: "16oz", price: 99, category: "Milky", image: "/products/milky-white-choco.webp" },
  { id: "white-choco-22", name: "Milky White Choco", size: "22oz", price: 119, category: "Milky", image: "/products/milky-white-choco.webp" },
  { id: "milky-choco-16", name: "Milky Choco", size: "16oz", price: 99, category: "Milky", image: "/products/milky-choco.webp" },
  { id: "milky-choco-22", name: "Milky Choco", size: "22oz", price: 119, category: "Milky", image: "/products/milky-choco.webp" },
  { id: "matcha-16", name: "Matcha Latte", size: "16oz", price: 109, category: "Matcha", image: "/products/matcha-latte.webp", bestseller: true },
  { id: "matcha-22", name: "Matcha Latte", size: "22oz", price: 129, category: "Matcha", image: "/products/matcha-latte.webp", bestseller: true },
  { id: "strawberry-matcha-16", name: "Strawberry Matcha", size: "16oz", price: 109, category: "Matcha", image: "/products/strawberry-matcha.webp" },
  { id: "strawberry-matcha-22", name: "Strawberry Matcha", size: "22oz", price: 129, category: "Matcha", image: "/products/strawberry-matcha.webp" },
  { id: "mango-matcha-16", name: "Mango Matcha", size: "16oz", price: 109, category: "Matcha", image: "/products/mango-matcha.webp" },
  { id: "mango-matcha-22", name: "Mango Matcha", size: "22oz", price: 129, category: "Matcha", image: "/products/mango-matcha.webp" },
  { id: "blueberry-matcha-16", name: "Blueberry Matcha", size: "16oz", price: 109, category: "Matcha", image: "/products/blueberry-matcha.webp" },
  { id: "blueberry-matcha-22", name: "Blueberry Matcha", size: "22oz", price: 129, category: "Matcha", image: "/products/blueberry-matcha.webp" },
  { id: "biscoff-matcha-16", name: "Biscoff Matcha", size: "16oz", price: 119, category: "Matcha", image: "/products/biscoff-matcha.webp" },
  { id: "biscoff-matcha-22", name: "Biscoff Matcha", size: "22oz", price: 139, category: "Matcha", image: "/products/biscoff-matcha.webp" },
  { id: "oreo-matcha-16", name: "Oreo Matcha", size: "16oz", price: 119, category: "Matcha", image: "/products/oreo-matcha.webp" },
  { id: "oreo-matcha-22", name: "Oreo Matcha", size: "22oz", price: 139, category: "Matcha", image: "/products/oreo-matcha.webp" },

  { id: "green-apple-16", name: "Green Apple", size: "16oz", price: 39, category: "Soda", image: "/products/green-apple.webp" },
  { id: "green-apple-22", name: "Green Apple", size: "22oz", price: 49, category: "Soda", image: "/products/green-apple.webp" },
  { id: "mango-soda-16", name: "Mango", size: "16oz", price: 39, category: "Soda", image: "/products/mango.webp" },
  { id: "mango-soda-22", name: "Mango", size: "22oz", price: 49, category: "Soda", image: "/products/mango.webp" },
  { id: "orange-16", name: "Orange", size: "16oz", price: 39, category: "Soda", image: "/products/orange.webp" },
  { id: "orange-22", name: "Orange", size: "22oz", price: 49, category: "Soda", image: "/products/orange.webp" },
  { id: "strawberry-soda-16", name: "Strawberry", size: "16oz", price: 39, category: "Soda", image: "/products/strawberry.webp" },
  { id: "strawberry-soda-22", name: "Strawberry", size: "22oz", price: 49, category: "Soda", image: "/products/strawberry.webp" },
  { id: "watermelon-16", name: "Watermelon", size: "16oz", price: 39, category: "Soda", image: "/products/watermelon.webp" },
  { id: "watermelon-22", name: "Watermelon", size: "22oz", price: 49, category: "Soda", image: "/products/watermelon.webp" },
  { id: "blueberry-soda-16", name: "Blueberry", size: "16oz", price: 39, category: "Soda", image: "/products/blueberry.webp" },
  { id: "blueberry-soda-22", name: "Blueberry", size: "22oz", price: 49, category: "Soda", image: "/products/blueberry.webp" },
  { id: "peach-16", name: "Peach", size: "16oz", price: 39, category: "Soda", image: "/products/peach.webp" },
  { id: "peach-22", name: "Peach", size: "22oz", price: 49, category: "Soda", image: "/products/peach.webp" },

  { id: "choco-boom-16", name: "SYP Choco Boom", size: "16oz", price: 99, category: "Signature", image: "/products/syp-choco-boom.webp", bestseller: true },
  { id: "choco-boom-22", name: "SYP Choco Boom", size: "22oz", price: 119, category: "Signature", image: "/products/syp-choco-boom.webp", bestseller: true },
  { id: "white-rush-16", name: "SYP White Rush", size: "16oz", price: 99, category: "Signature", image: "/products/syp-white-rush.webp" },
  { id: "white-rush-22", name: "SYP White Rush", size: "22oz", price: 119, category: "Signature", image: "/products/syp-white-rush.webp" },

  { id: "fries-small", name: "SYP Bites", size: "Small", price: 49, category: "Fries", image: "/products/syp-fries.webp" },
  { id: "fries-medium", name: "SYP Cravings", size: "Medium", price: 79, category: "Fries", image: "/products/syp-fries.webp" },
  { id: "fries-barkada", name: "SYP Overload", size: "Barkada", price: 119, category: "Fries", image: "/products/syp-fries.webp" },
] as const;

type QuoteCategory = "Coffee" | "Matcha" | "Soda" | "Milky" | "Fries";

const QUOTES_BY_CATEGORY: Record<QuoteCategory, string[]> = {
  Coffee: [
    "Kape muna bago magdesisyon.",
    "Hindi lahat ng puyat, dahil sa trabaho. Minsan dahil sa kape.",
    "One sip at a time. Kakayanin din ang araw na ’to.",
    "Kung magulo ang mundo, timplahan muna ng kape.",
    "Coffee first. Overthink later.",
    "Hindi man maayos ang lahat, at least masarap ang kape.",
    "Para sa mga gising pa kahit pagod na.",
    "May mga bagay na mas madaling harapin pagkatapos ng unang sip.",
    "Kape ang pahinga ng utak na ayaw tumigil.",
    "Late-night thoughts, extra coffee shots.",
    "Hindi lahat ng kailangan ay sagot. Minsan kape lang.",
    "Ang tunay na plot twist? Masarap pala ang araw na ’to.",
    "Kape muna, saka natin problemahin ang problema.",
    "Strong coffee for the soft-hearted.",
    "Kung puyat ka rin, cheers sa ating dalawa.",
    "Kape ang plus one ko sa bawat puyatan.",
    "Hindi lahat ng late night ay malungkot. Minsan may kape lang.",
    "May meeting sa umaga, pero may kape muna sa gabi.",
    "Espresso yourself. Walang judgment dito.",
    "Ang plano: isang sip. Ang ending: ubos agad.",
    "Coffee break muna sa mundong walang pause.",
    "Hindi pa ready ang utak ko. Painitin muna natin sa kape.",
    "Kung may extra shot, baka may extra lakas din.",
    "Puyat responsibly. Kape responsibly din.",
    "Mas kaya ang Monday kapag may iced coffee.",
    "Hindi ako galit, kulang lang sa kape.",
    "Kape muna bago mag-send ng long message.",
    "My daily dose of kaya ko pa.",
    "Para sa mga taong naka-survive sa araw na ’to.",
    "Kape ang co-worker kong hindi nagrereklamo.",
    "Sip slowly. The world can wait a little.",
    "Ang deadline, bukas pa. Itong kape, ngayon na.",
    "Kape muna bago mag-reply ng “noted.”",
    "Small cup, big plans. Large cup, bigger plans.",
    "Sa bawat sip, may konting dagdag na tapang.",
    "Hindi lahat ng sagot nasa Google. Minsan nasa coffee.",
    "Caffeine and courage, please.",
    "Kung hindi pa kaya, dagdagan muna ng yelo at kape.",
    "Kape para sa utak na maraming tabs open.",
    "Night shift mood: gising ang mata, loading ang isip.",
    "May goals ako. Pero may kape muna.",
    "Bawat araw may bagong chance—at bagong timpla.",
    "Coffee: dahil hindi pa puwedeng mag-hibernate.",
    "Take a sip. Take a breath. Try again."
  ],
  Matcha: [
    "Matcha muna. Dahan-dahan lang ang buhay.",
    "Green flag today: matcha ang order mo.",
    "Stay calm and sip matcha.",
    "Hindi lahat green flag, pero itong matcha oo.",
    "Matcha mood: soft, chill, at medyo sosyal.",
    "A little green, a little peace.",
    "Kung magulo ang isip, hanap muna ng matcha moment.",
    "Matcha ka muna bago ka mag-overthink.",
    "Green tea, clear mind… sana all.",
    "Soft life starts with one good sip.",
    "Hindi minamadali ang happiness, pati matcha.",
    "Matcha made me do it.",
    "Mas kalmado ang mundo kapag may matcha sa kamay.",
    "Your daily dose of green goodness.",
    "Kung kailangan mo ng sign para mag-matcha, ito na ’yon.",
    "Matcha made my day a little greener.",
    "Green tea, good mood, no rush.",
    "Matcha date with myself. Deserve ko ’to.",
    "Soft vibes lang, isang matcha at a time.",
    "Matcha muna bago mag-decide kung red flag siya.",
    "Stay grounded. Stay green. Sip matcha.",
    "Ang buhay ay hindi race. Matcha break muna.",
    "Matcha sa kamay, peace sa isip—manifesting.",
    "May pagka-sweet, may pagka-earthy, just like life.",
    "A little matcha magic for your long day.",
    "Hindi kailangan perfect ang araw para mag-matcha.",
    "Green on the outside, chill on the inside.",
    "Matcha mood: unbothered kunwari.",
    "Kung busy ang mundo, slow sip ka muna.",
    "Matcha is my kind of green light.",
    "For the soft souls and slow mornings.",
    "Hindi lahat ng green ay gulay. Minsan happiness.",
    "Matcha muna bago mag-check ng messages.",
    "A calm little treat for a busy mind.",
    "Kahit maraming ganap, make room for matcha.",
    "Main character energy, matcha edition.",
    "Matcha at chill? Perfect combination.",
    "Keep your standards high and your matcha cold.",
    "Green goodness, one sip closer to okay.",
    "Hindi kailangan ng dahilan para mag-matcha.",
    "Matcha break: because your peace matters.",
    "Sana kasing smooth ng matcha ang plans mo.",
    "Matcha muna, overthinking mamaya na.",
    "A green little reminder to be kind to yourself."
  ],
  Soda: [
    "Pop, fizz, sip! Good vibes muna.",
    "Bubbly drink para sa bubbly mood.",
    "Bawat fizz, bawas stress.",
    "Soda muna bago sumabog sa inis.",
    "Stay cool. Keep it bubbly.",
    "Kung flat ang mood, dagdagan ng fizz.",
    "Sparkling vibes lang tayo today.",
    "Isang sip, parang mini celebration.",
    "Life’s better with a little sparkle.",
    "Chill ka lang, hindi pa ubos ang yelo.",
    "Sweet, fizzy, at walang kailangang i-overthink.",
    "Fizz happens. Sip happens. Smile na lang.",
    "Para sa mga gustong mag-refresh ng mood.",
    "More bubbles, less troubles.",
    "Palamig muna ng ulo, soda muna.",
    "Fizz your way through the day.",
    "Good mood loading… add ice and bubbles.",
    "Soda sa kamay, worries on airplane mode.",
    "Too cool to lose my fizz.",
    "Kapag mainit ang ulo, malamig na soda ang sagot.",
    "Pop open a little happiness.",
    "Sarap ng buhay kapag may konting sparkle.",
    "Sip, smile, repeat. Keep it fizzy.",
    "Bubbly inside, chill outside.",
    "Isang soda break para sa busy na brain.",
    "No drama, just soda.",
    "Refresh button? Nasa unang sip.",
    "Mas colorful ang araw kapag fruity ang soda.",
    "Stay fizzy, little KasYP.",
    "Ang problema, mamaya na. Fizz muna.",
    "Ice cold and unbothered.",
    "Puno ng bubbles, hindi ng worries.",
    "Soda vibes: sweet, bright, and a little extra.",
    "Kung kailangan ng reset, sip ka muna.",
    "Fruit flavor, fresh start.",
    "Good things come to those who chill.",
    "Keep calm and let it fizz.",
    "Bawat bubble, mini good-vibes delivery.",
    "Soda muna bago mag-overreact.",
    "Cool drink, cooler mood.",
    "Fruity, fizzy, feeling fancy.",
    "Walang boring sa may fizz.",
    "Make today pop!",
    "Sana kasing gaan ng soda ang pakiramdam mo."
  ],
  Milky: [
    "Milky comfort para sa pagod na puso.",
    "Hindi lahat ng comfort may yakap. Minsan malamig at milky lang.",
    "Sweet sip, soft mood.",
    "Kung gusto mo ng lambing, start with something milky.",
    "Creamy, dreamy, at deserve mo ’to.",
    "A little sweetness can change the mood.",
    "Milky drink, less overthinking.",
    "Hindi man sweet ang araw, at least ang iniinom mo.",
    "Soft heart, creamy drink.",
    "Minsan ang sagot ay chocolate. Minsan white chocolate.",
    "Comfort drink para sa main character na pagod na.",
    "Life’s messy. Make it creamy.",
    "Isang creamy sip muna bago bumalik sa realidad.",
    "Sweetness level: deserve ko ’to.",
    "Kung kailangan ng pahinga, milky muna.",
    "Creamy comfort in every sip.",
    "Chocolate muna bago mag-chat ng ex.",
    "Sweet tooth, happy mood.",
    "Milky moments for the tired ones.",
    "Hindi lahat ng sweet ay tao. Minsan drink lang.",
    "Extra creamy, extra happy.",
    "A little chocolate can fix this moment.",
    "Comfort level: may straw at malamig na milky drink.",
    "For the days that need a sweeter ending.",
    "Soft life, one creamy sip at a time.",
    "Milk tea? Hindi ngayon. Milky goodness muna.",
    "Ang puso ko: soft. Ang drink ko: creamy.",
    "Minsan kailangan mo lang ng chocolate break.",
    "Sweet escape from a long day.",
    "Milky drink, cozy thoughts.",
    "Mas okay ang mood kapag may chocolate sa cup.",
    "Kung hindi ka kayang i-comfort ng mundo, try this sip.",
    "Creamy ang drink, chill ang mission.",
    "Sana lahat ng problema natutunaw tulad ng yelo.",
    "A little sweetness for your inner child.",
    "Your comfort drink called. Sabi niya, sip na.",
    "Chocolate vibes, zero pressure.",
    "Today’s agenda: sip, chill, repeat.",
    "Hindi kailangan maging okay agad. Dahan-dahan lang.",
    "Sweet moments deserve a cold cup.",
    "Milo mood: nostalgic at masarap.",
    "Oreo in the mood, milky in the cup.",
    "White choco, soft life.",
    "A creamy little treat just for you."
  ],
  Fries: [
    "Fries muna bago seryosong usapan.",
    "Ang tunay na love language ay share ng fries.",
    "Good friends share fries. Best friends order extra.",
    "Stress fries? Approved.",
    "Walang problema na hindi kayang samahan ng fries.",
    "Crispy outside, soft inside—relate ka ba?",
    "Isang fry pa. Last na talaga… siguro.",
    "Fries are cheaper than overthinking.",
    "Kung may fries, may dahilan para mag-stay.",
    "Small bites, big happiness.",
    "Fries before guys. Fries before worries.",
    "Extra cheese, extra happiness.",
    "Crunch muna bago kwento.",
    "One fry is never just one fry.",
    "Sharing is caring, pero bili ka rin ng sarili mo.",
    "Crispy bites for crispy comebacks.",
    "Fries: the real reason we came here.",
    "Cheese, please. Problems, later.",
    "Kapag gutom, lahat personal.",
    "Fries lang ang gusto kong ka-share ngayon.",
    "Small fries? Big feelings.",
    "Mas masaya ang kwentuhan kapag may fries sa gitna.",
    "A little crunch goes a long way.",
    "Sour cream mood: chill pero may flavor.",
    "BBQ, cheese, or chili? Walang maling sagot.",
    "Barkada rule: order extra fries.",
    "Huwag mag-away. Hatiin ang fries.",
    "Crispy happiness, freshly served.",
    "Kung may fries, stay pa tayo.",
    "Snack attack? We got you.",
    "The only drama I want is extra cheese.",
    "Fries are my side of the story.",
    "Mas okay ang problema kapag may kinakagat.",
    "Isang bite pa bago umuwi.",
    "Good company, great fries.",
    "May fries ka na, may peace offering ka pa.",
    "Snack muna bago serious talk.",
    "Crispy outside, KasYP inside.",
    "Order more. Regret never."
  ]
};

function getQuoteCategory(product: { category: string }): QuoteCategory {
  if (product.category === "Matcha") return "Matcha";
  if (product.category === "Soda") return "Soda";
  if (product.category === "Fries") return "Fries";
  if (product.category === "Milky" || product.category === "Signature") return "Milky";
  return "Coffee";
}

function getWrapTheme(category: string, drinkName: string): "strawberry" | "coffee" | "soda" | "matcha" | "milky" {
  const name = drinkName.toLowerCase();
  if (name.includes("strawberry")) return "strawberry";
  if (category === "Soda") return "soda";
  if (category === "Matcha") return "matcha";
  if (category === "Coffee") return "coffee";
  return "milky";
}

function getRandomQuote(category: QuoteCategory, current = "") {
  const quotes = QUOTES_BY_CATEGORY[category];
  const choices = quotes.filter((item) => item !== current);
  return choices[Math.floor(Math.random() * choices.length)] ?? quotes[0];
}

export default function CupWrapPage() {
  const [selectedProductId, setSelectedProductId] = useState("spanish-22");
  const [menuSearch, setMenuSearch] = useState("");
  const selectedProduct = CUP_MENU.find((item) => item.id === selectedProductId) ?? CUP_MENU[0];
  const cup = selectedProduct.size;
  const price = String(selectedProduct.price);
  const drinkName = selectedProduct.name;
  const filteredMenu = CUP_MENU.filter((item) => (item.name + " " + item.size).toLowerCase().includes(menuSearch.toLowerCase()));
  const [quote, setQuote] = useState(() => getRandomQuote(getQuoteCategory(CUP_MENU.find((item) => item.id === "spanish-22") ?? CUP_MENU[0])));
  const [customerName, setCustomerName] = useState("");
  const [optionalNote, setOptionalNote] = useState("");
  const [startingCash, setStartingCash] = useState("0");
  const [orderNumber, setOrderNumber] = useState("001");
  const [printQueue, setPrintQueue] = useState<PrintRecord[]>([]);
  const [orderDateTime, setOrderDateTime] = useState(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [showQr, setShowQr] = useState(true);
  const [history, setHistory] = useState<PrintRecord[]>([]);
  const [shiftLabel, setShiftLabel] = useState("Current shift");

  useEffect(() => {
    try {
      const savedCash = window.localStorage.getItem(STARTING_CASH_KEY);
      if (savedCash !== null) setStartingCash(savedCash);
      const saved = window.localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PrintRecord[];
        setHistory(parsed);
        const maxOrder = parsed.reduce((max, item) => Math.max(max, Number(item.orderNumber) || 0), 0);
        const savedNext = Number(window.localStorage.getItem(ORDER_COUNTER_KEY)) || 0;
        const next = Math.max(maxOrder + 1, savedNext || 1);
        setOrderNumber(String(next).padStart(3, "0"));
        window.localStorage.setItem(ORDER_COUNTER_KEY, String(next));
      } else {
        const savedNext = Number(window.localStorage.getItem(ORDER_COUNTER_KEY)) || 1;
        setOrderNumber(String(savedNext).padStart(3, "0"));
      }
    } catch { /* Ignore unavailable or invalid local history. */ }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }
    catch { /* Browser storage may be unavailable. */ }
  }, [history]);

  const makePrintRecord = (): PrintRecord => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    printedAt: new Date().toISOString(), cup, drinkName, price, category: selectedProduct.category, theme: getWrapTheme(selectedProduct.category, drinkName),
    customerName: customerName.trim(), orderNumber: orderNumber.trim() || "—",
    orderDateTime, quote: quote.trim(), note: optionalNote.trim(),
  });

  const resetOrderNumber = () => {
    if (!window.confirm("I-reset ang order number sa 001? Hindi nito buburahin ang print history.")) return;
    try { window.localStorage.setItem(ORDER_COUNTER_KEY, "1"); } catch { /* Ignore unavailable storage. */ }
    setOrderNumber("001");
  };

  const updateStartingCash = (value: string) => {
    const normalized = value.replace(/[^0-9.]/g, "");
    setStartingCash(normalized);
    try { window.localStorage.setItem(STARTING_CASH_KEY, normalized); } catch { /* Ignore unavailable storage. */ }
  };

  const recordAndPrint = () => {
    const record = makePrintRecord();
    const next = (Number(orderNumber) || 0) + 1;
    try { window.localStorage.setItem(ORDER_COUNTER_KEY, String(next)); } catch { /* Ignore unavailable storage. */ }
    setOrderNumber(String(next).padStart(3, "0"));
    setHistory((previous) => [record, ...previous]);
    setQuote(getRandomQuote(getQuoteCategory(selectedProduct), quote));
    window.setTimeout(() => window.print(), 100);
  };

  const addToPrintLayout = () => {
    if (printQueue.length >= 4) {
      window.alert("Maximum 4 wraps per print batch on the current 297mm print layout. Print this batch first, then add more.");
      return;
    }
    setPrintQueue((previous) => [...previous, makePrintRecord()]);
    const next = (Number(orderNumber) || 0) + 1;
    try { window.localStorage.setItem(ORDER_COUNTER_KEY, String(next)); } catch { /* Ignore unavailable storage. */ }
    setOrderNumber(String(next).padStart(3, "0"));
    setQuote(getRandomQuote(getQuoteCategory(selectedProduct), quote));
  };

  const printQueued = () => {
    if (!printQueue.length) return;
    setHistory((previous) => [...printQueue.slice().reverse(), ...previous]);
    window.setTimeout(() => {
      window.print();
      setPrintQueue([]);
    }, 150);
  };

  const downloadHistory = () => {
    const header = ["Printed at", "Shift", "Cup", "Drink", "Price", "Customer", "Order #", "Order date/time", "Quote"];
    const rows = history.map((item) => [new Date(item.printedAt).toLocaleString("en-PH"), shiftLabel, item.cup, item.drinkName, item.price, item.customerName, item.orderNumber, item.orderDateTime, item.quote]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\\r\\n");
    const blob = new Blob(["\\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `syp-cup-wrap-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (window.confirm("I-clear ang lahat ng saved print history sa browser na ito? I-export muna ang CSV kung kailangan ng kopya.")) setHistory([]);
  };

  // Starting estimates only: measure the actual cup before printing.
  const wrapLength = cup === "8oz" ? 190 : cup === "12oz" ? 210 : cup === "16oz" ? 230 : cup === "22oz" ? 250 : cup === "Small" ? 190 : cup === "Medium" ? 210 : 250;
  const wrapHeight = 45;
  const qrUrl = useMemo(
    () => "https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=1&data=" + encodeURIComponent(LOYALTY_URL),
    [],
  );

  return (
    <main className="wrap-page">
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f4eee5; color: #342317; font-family: Arial, sans-serif; }
        .wrap-page { min-height: 100vh; padding: 22px; }
        .wrap-shell { max-width: 1000px; margin: 0 auto; }
        .wrap-head { display:flex; align-items:center; gap:14px; margin-bottom:20px; }
        .wrap-head img { width:58px; height:58px; object-fit:contain; border-radius:12px; background:#fff; }
        .wrap-head h1 { margin:0; font-size:clamp(22px,4vw,32px); }
        .wrap-head p { margin:5px 0 0; color:#85664b; font-size:11px; font-weight:800; letter-spacing:.13em; }
        .wrap-grid { display:grid; grid-template-columns:280px minmax(0,1fr); gap:18px; align-items:start; }
        .wrap-panel { background:#fffdf9; border:1px solid #e5d4c1; border-radius:16px; padding:18px; min-width:0; }
        .wrap-panel h2 { font-size:17px; margin:0 0 8px; }
        .wrap-muted { font-size:12px; color:#856f5a; line-height:1.55; }
        .wrap-field { display:grid; gap:7px; margin:14px 0; }
        .wrap-field label { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; }
        .wrap-field select,.wrap-field input { width:100%; border:1px solid #d9c4ac; border-radius:9px; padding:11px; background:white; color:#342317; }
        .wrap-btn { border:0; border-radius:9px; padding:12px 14px; background:#62442e; color:white; font-weight:800; cursor:pointer; }
        .wrap-btn.secondary { background:#eee1d0; color:#62442e; }
        .wrap-preview { overflow-x:auto; padding:14px; background:#e7d8c6; border-radius:12px; }
        .wrap-art { width:100%; min-width:540px; aspect-ratio:250 / 62; display:grid; grid-template-columns:1fr 1.25fr 1fr; gap:9px; align-items:center; padding:10px 14px; background:#fff; color:#000; border:2px solid #000; outline:1px solid #000; outline-offset:3px; border-radius:4px; }
        .wrap-art.theme-coffee,.wrap-art.theme-strawberry,.wrap-art.theme-soda,.wrap-art.theme-matcha,.wrap-art.theme-milky { background:#fff; color:#000; border-color:#000; outline-color:#000; }
        .wrap-art .wrap-block { border-color:#000; }
        .wrap-art .wrap-tag,.wrap-art .wrap-social,.wrap-art .wrap-side-date { color:#000; }
        .wrap-motif { display:block; width:100%; max-width:29mm; height:13mm; color:#000; object-fit:contain; margin:0 auto 1mm; flex-shrink:0; }
        .wrap-art .wrap-block { border-color:var(--wrap-accent); }
        .wrap-art .wrap-tag, .wrap-art .wrap-social, .wrap-art .wrap-side-date { color:var(--wrap-ink); }
        .wrap-amenities { display:flex; flex-wrap:wrap; gap:5px 8px; font-size:8px; font-weight:800; margin-top:10px; }
        .wrap-amenities span { border:1px solid currentColor; border-radius:999px; padding:3px 5px; }
        .wrap-stamp-title { font-family:Georgia,serif; font-style:italic; font-weight:800; font-size:clamp(12px,1.8vw,19px); line-height:1.05; text-align:center; }
        .wrap-order-box { border:1px solid currentColor; border-radius:6px; padding:5px; margin-top:6px; text-align:center; font-size:9px; font-weight:900; }
        .wrap-block { height:100%; min-width:0; display:flex; flex-direction:column; justify-content:center; border-right:1px solid #aaa; padding-right:8px; }
        .wrap-script { font-family:Georgia,serif; font-style:italic; font-weight:800; font-size:clamp(14px,2vw,23px); line-height:1.05; }
        .wrap-brand { font-size:clamp(16px,2.5vw,27px); font-weight:900; letter-spacing:.03em; line-height:1; }
        .wrap-tag { font-size:9px; font-weight:800; letter-spacing:.12em; margin-top:5px; }
        .wrap-drink { font-size:clamp(17px,2.5vw,30px); font-weight:900; text-align:center; line-height:1.05; overflow-wrap:anywhere; }
        .wrap-price { font-size:clamp(12px,1.8vw,18px); font-weight:900; text-align:center; margin-top:3px; }
        .wrap-order-meta { font-size:8px; font-weight:800; line-height:1.4; margin-top:5px; overflow-wrap:anywhere; }
        .wrap-quote { font-family:Georgia,serif; font-size:clamp(10px,1.4vw,16px); font-style:italic; font-weight:800; line-height:1.12; overflow-wrap:anywhere; text-align:center; }
        .wrap-logo { display:none!important; }
        .wrap-print-logo { display:block; width:34mm; max-width:100%; height:13mm; object-fit:contain; object-position:center; filter:grayscale(1) contrast(2); margin:0 auto 1mm; }
        .wrap-qr { width:54px; height:54px; object-fit:contain; background:white; padding:2px; }
        .wrap-social { font-size:8px; font-weight:800; margin-top:4px; overflow-wrap:anywhere; }
        .wrap-side-date { font-size:7px; font-weight:800; text-align:center; line-height:1.2; margin-top:4px; overflow-wrap:anywhere; }
        .wrap-notes { font-size:12px; line-height:1.55; color:#70553e; }
        @media(max-width:760px) { .wrap-page { padding:12px; } .wrap-grid { grid-template-columns:1fr; } }
        @page { size: 80mm auto; margin: 0; }
        @media print {
          html, body { margin:0!important; padding:0!important; background:white!important; }
          body * { visibility:hidden!important; }
          .wrap-print-target, .wrap-print-target * { visibility:visible!important; }
          .wrap-page { padding:0!important; margin:0!important; }
          .wrap-shell, .wrap-head, .wrap-grid, .wrap-panel { display:block!important; width:80mm!important; max-width:80mm!important; margin:0!important; padding:0!important; border:0!important; background:white!important; }
          .wrap-head, .wrap-controls, .wrap-preview, .wrap-instructions, .wrap-history { display:none!important; }
          .wrap-print-target { display:block!important; position:fixed!important; left:0!important; top:0!important; width:80mm!important; height:297mm!important; overflow:hidden!important; background:#fff!important; }
          .wrap-print-art { position:absolute!important; left:50%!important; top:var(--wrap-top, 50%)!important; width:${wrapLength}mm!important; height:62mm!important; transform-origin:center center!important; transform:translate(-50%,-50%) rotate(90deg)!important; display:grid!important; grid-template-columns:1fr 1.25fr 1fr!important; gap:3mm!important; padding:4mm!important; background:#fff!important; color:#000!important; border:1.2mm solid #000!important; outline:0.35mm solid #000!important; outline-offset:1mm!important; print-color-adjust:exact!important; -webkit-print-color-adjust:exact!important; }
          .wrap-print-art .wrap-script { font-size:15pt!important; line-height:1.08!important; }
          .wrap-print-art .wrap-brand { font-size:16pt!important; line-height:1!important; }
          .wrap-print-art .wrap-quote { display:block!important; font-size:12pt!important; line-height:1.15!important; max-height:none!important; overflow:visible!important; overflow-wrap:anywhere!important; text-align:center!important; }
          .wrap-print-art .wrap-drink { font-size:16pt!important; line-height:1.05!important; overflow-wrap:anywhere!important; }
          .wrap-print-art.theme-coffee,.wrap-print-art.theme-strawberry,.wrap-print-art.theme-soda,.wrap-print-art.theme-matcha,.wrap-print-art.theme-milky { background:#fff!important; color:#000!important; border-color:#000!important; outline-color:#000!important; }
           .wrap-print-art .wrap-block { border-color:#000!important; }
           .wrap-print-art .wrap-tag,.wrap-print-art .wrap-social,.wrap-print-art .wrap-side-date { color:#000!important; }
           .wrap-print-art .wrap-amenities span { border-color:#000!important; }
           .wrap-print-art .wrap-stamp-title { font-size:12pt!important; line-height:1.05!important; }
           .wrap-print-art .wrap-order-box { border-color:#000!important; }
           .wrap-print-art .wrap-price { font-size:12pt!important; font-weight:900!important; text-align:center!important; margin-top:1mm!important; }
          .wrap-print-art .wrap-order-meta { font-size:6pt!important; }
          .wrap-print-art .wrap-logo { display:none!important; }
          .wrap-print-art .wrap-print-logo { width:29mm!important; height:12mm!important; object-fit:contain!important; filter:grayscale(1) contrast(2)!important; margin:0 auto 0.5mm!important; }
          
          .wrap-print-art .wrap-side-date { font-size:7pt!important; }
          .wrap-print-art .wrap-qr { display:block!important; width:18mm!important; height:18mm!important; min-width:18mm!important; min-height:18mm!important; flex-shrink:0!important; object-fit:contain!important; margin:1mm auto!important; }
          .wrap-print-art .wrap-social { font-size:7pt!important; }
          .wrap-print-art .wrap-tag { font-size:7pt!important; letter-spacing:.04em!important; margin-top:1mm!important; }
          .wrap-print-art .wrap-motif { width:27mm!important; max-width:27mm!important; height:12mm!important; margin:0 auto 0.5mm!important; flex-shrink:0!important; }
          .wrap-print-art .wrap-block { min-width:0!important; padding-right:2mm!important; justify-content:space-evenly!important; overflow:visible!important; }
          .wrap-print-art .wrap-amenities { font-size:6pt!important; gap:1mm!important; margin-top:1mm!important; }
          .wrap-print-art .wrap-amenities span { padding:0.5mm 1mm!important; }
          .wrap-print-art .wrap-order-box { font-size:8pt!important; padding:1mm!important; margin-top:1mm!important; }
          .wrap-print-art .wrap-social,.wrap-print-art .wrap-side-date,.wrap-print-art .wrap-order-meta { font-size:6pt!important; margin-top:0.5mm!important; }
        }
      `}</style>

      <div className="wrap-shell">
        <header className="wrap-head">
          <img src={LOGO_URL} alt="SYP ON CAFÉ logo" />
          <div>
            <h1>SYP Cup Wrap Studio</h1>
            <p>STREET • ICED • BREWED</p>
          </div>
        </header>

        <div className="wrap-grid">
          <section className="wrap-panel wrap-controls">
            <h2>Customize cup wrap</h2>
            <p className="wrap-muted">Compact cup wrap for 80mm thermal roll paper. Includes hot 8oz/12oz, price, and a shorter layout. Measure your cup before printing.</p>
            <div className="wrap-field">
              <label htmlFor="menu-search">Search drink from POS menu</label>
              <input id="menu-search" value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} placeholder="Type Spanish Latte, Matcha, Soda..." />
            </div>
            <div className="wrap-field">
              <label htmlFor="menu-item">Drink &amp; size — price auto-filled</label>
              <select id="menu-item" value={selectedProductId} onChange={(e) => { const nextId = e.target.value; const nextProduct = CUP_MENU.find((item) => item.id === nextId) ?? CUP_MENU[0]; setSelectedProductId(nextId); setQuote(getRandomQuote(getQuoteCategory(nextProduct), quote)); }} size={Math.min(7, Math.max(3, filteredMenu.length))} style={{height:"auto",minHeight:48}}>
                {filteredMenu.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.size} — ₱{item.price}</option>)}
              </select>
              <p className="wrap-muted">Selected: <strong>{drinkName} · {cup} — ₱{price}</strong>. Hanapin lang at piliin ang exact size; automatic ang presyo mula sa POS menu list.</p>
            </div>
            <div className="wrap-field">
              <label htmlFor="customer-name">Customer name (optional)</label>
              <input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value.slice(0, 40))} maxLength={40} placeholder="e.g. Alex" />
            </div>
            <div className="wrap-field">
              <label htmlFor="order-number">Order number / pang-ilan</label>
              <input id="order-number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.slice(0, 12))} maxLength={12} placeholder="e.g. 001" />
            </div>
            <div className="wrap-field">
              <label htmlFor="optional-note">Optional note</label>
              <input id="optional-note" value={optionalNote} onChange={(e) => setOptionalNote(e.target.value.slice(0, 80))} maxLength={80} placeholder="e.g. less ice, no straw" />
            </div>
            <div className="wrap-field">
              <label htmlFor="order-date-time">Order date &amp; time</label>
              <input id="order-date-time" type="datetime-local" value={orderDateTime} onChange={(e) => setOrderDateTime(e.target.value)} />
            </div>
            <div className="wrap-field">
              <label htmlFor="main-quote">Drink-matched quote · curated per category</label>
              <input id="main-quote" value={quote} onChange={(e) => setQuote(e.target.value.slice(0, 120))} maxLength={120} />
              <button type="button" className="wrap-btn secondary" onClick={() => setQuote(getRandomQuote(getQuoteCategory(selectedProduct), quote))}>🎲 Random funny quote</button>
              <p className="wrap-muted">Automatic na tugma ang quote sa napiling drink category. Matcha = matcha lines, Coffee = coffee lines, Soda = fizzy lines, Milky/Signature = creamy lines. Puwede mo pa ring i-edit ang quote.</p>
            </div>
            <div className="wrap-field">
              <label><input type="checkbox" checked={showQr} onChange={(e) => setShowQr(e.target.checked)} /> Include Facebook QR</label>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button type="button" className="wrap-btn secondary" onClick={resetOrderNumber}>↺ Reset order number</button>
              <button type="button" className="wrap-btn secondary" onClick={addToPrintLayout} disabled={printQueue.length >= 4}>＋ Add to print layout</button>
              <button type="button" className="wrap-btn" onClick={recordAndPrint}>Print cup wrap + record</button>
            </div>
            <p className="wrap-muted">Nasa print layout: {printQueue.length} wrap(s). Idagdag muna ang bawat drink/quote, pagkatapos pindutin ang Print queued wraps para sabay-sabay.</p>
            <button type="button" className="wrap-btn" onClick={printQueued} disabled={!printQueue.length}>Print queued wraps ({printQueue.length})</button>
            {printQueue.length > 0 && <button type="button" className="wrap-btn secondary" onClick={() => setPrintQueue([])}>Clear print layout</button>}
            <p className="wrap-muted">Print using thermal printer with continuous 80mm paper, portrait feed, and scaling at 100% / Actual size. Test on plain paper first.</p>
          </section>

          <section className="wrap-panel">
            <h2>360° wrap preview · {cup}</h2>
            <p className="wrap-muted">Preview only. Measure your actual cup circumference and wrap height before final printing.</p>
            <div className="wrap-preview">
              <WrapArt quote={quote} showQr={showQr} qrUrl={qrUrl} drinkName={drinkName} price={price} cup={cup} customerName={customerName} orderNumber={orderNumber} orderDateTime={orderDateTime} theme={getWrapTheme(selectedProduct.category, drinkName)} />
            </div>
            <div className="wrap-instructions wrap-notes">
              <p><strong>Important:</strong> 190mm (8oz), 210mm (12oz), 230mm (16oz), and 250mm (22oz) are starting estimates, not guaranteed fit. Cups vary by brand and taper. Measure around the cup where the strip will sit, then adjust the length in code if needed.</p>
              <p>For ordinary thermal paper, the print will be monochrome (black on paper). The brown/cream color is a design preview; thermal printers do not print brown ink. Use the wrap as a long paper band and secure the ends with tape.</p>
              <p>Facebook destination: <strong>facebook.com/SypOnCafe</strong></p>
            </div>
          </section>
        </div>

          <section className="wrap-panel wrap-history">
            <h2>Print history &amp; shift count</h2>
            <p className="wrap-muted">Bawat pindot sa “Print cup wrap + record” ay idaragdag dito para mabilang sa shift handover.</p>
            <div className="wrap-field">
              <label htmlFor="shift-label">Shift / staff label</label>
              <input id="shift-label" value={shiftLabel} onChange={(e) => setShiftLabel(e.target.value.slice(0, 40))} maxLength={40} placeholder="e.g. Night shift - Alex" />
            </div>
            <div className="wrap-field">
              <label htmlFor="starting-cash">Starting cash drawer (₱)</label>
              <input id="starting-cash" inputMode="decimal" value={startingCash} onChange={(e) => updateStartingCash(e.target.value)} placeholder="e.g. 1000" />
              <p className="wrap-muted">Opening cash na laman ng drawer. Automatic na naka-save sa browser na ito at makikita ulit kapag binuksan ang page sa parehong device.</p>
            </div>
            <div style={{padding:"12px 14px",borderRadius:10,background:"#f4eee5",margin:"12px 0"}}>
              <div className="wrap-muted">SHIFT OPENING CASH</div>
              <strong style={{fontSize:24}}>₱{(Number(startingCash) || 0).toLocaleString("en-PH", {minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",margin:"12px 0"}}>
              <strong>Total recorded prints: {history.length}</strong>
              <button type="button" className="wrap-btn secondary" onClick={downloadHistory} disabled={!history.length}>Export CSV</button>
              <button type="button" className="wrap-btn secondary" onClick={clearHistory} disabled={!history.length}>Clear history</button>
            </div>
            <div className="wrap-muted">Recent prints (latest first)</div>
            {history.length === 0 ? <p className="wrap-muted">Wala pang recorded prints sa browser na ito.</p> : (
              <div style={{overflowX:"auto",marginTop:8}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,textAlign:"left"}}>
                  <thead><tr><th style={{padding:8,borderBottom:"1px solid #d9c4ac"}}>Print time</th><th style={{padding:8,borderBottom:"1px solid #d9c4ac"}}>Order / Drink</th><th style={{padding:8,borderBottom:"1px solid #d9c4ac"}}>Cup</th></tr></thead>
                  <tbody>{history.map((item) => <tr key={item.id}><td style={{padding:8,borderBottom:"1px solid #eee"}}>{new Date(item.printedAt).toLocaleString("en-PH")}</td><td style={{padding:8,borderBottom:"1px solid #eee"}}><strong>#{item.orderNumber}</strong> · {item.drinkName}{item.customerName ? <div className="wrap-muted">{item.customerName}</div> : null}</td><td style={{padding:8,borderBottom:"1px solid #eee"}}>{item.cup}</td></tr>)}</tbody>
                </table>
              </div>
            )}
            <p className="wrap-muted">Note: browser-local history ito. Naka-save sa parehong device/browser lamang; hindi pa ito shared sa ibang cashier/device. Ang record ay ginagawa kapag pinindot ang print button, hindi nito makukumpirma kung lumabas talaga ang papel.</p>
          </section>
        <div className="wrap-print-target" aria-hidden="true">
          {(printQueue.length ? printQueue : [makePrintRecord()]).map((item, index) => <div className={`wrap-print-art theme-${item.theme || getWrapTheme(item.category || "Coffee", item.drinkName)}`} key={item.id} style={printQueue.length ? ({"--wrap-top": `${index * 64 + 31}mm`} as CSSProperties) : undefined}>
            <div className="wrap-block">
              <div className="wrap-script">Thank you ♥<br />for supporting<br />local &amp; choosing<br />SYP ON CAFÉ.</div>
              <WrapMotif theme={item.theme || getWrapTheme(item.category || "Coffee", item.drinkName)} />
              <div className="wrap-amenities"><span>FREE WI-FI</span><span>BOARD GAMES</span><span>YOUTUBE &amp; NETFLIX</span></div>
            </div>
            <div className="wrap-block" style={{alignItems:"center",textAlign:"center"}}>
              <WrapMotif theme={item.theme || getWrapTheme(item.category || "Coffee", item.drinkName)} />
              <img className="wrap-print-logo" src={LOGO_URL} alt="SYP ON CAFÉ" />
              <div className="wrap-brand">SYP ON CAFÉ</div>
              <div className="wrap-tag">— STREET • ICED • BREWED —</div>
              <div className="wrap-drink">{item.drinkName || "YOUR DRINK"}</div>
              <div className="wrap-order-box">ORDER #{item.orderNumber || "—"}<br />{item.cup} · ₱{item.price || "0"}</div>
              {item.customerName ? <div className="wrap-order-meta">FOR: {item.customerName}</div> : null}
              {item.note ? <div className="wrap-order-meta">NOTE: {item.note}</div> : null}
            </div>
            <div className="wrap-block" style={{borderRight:0,paddingRight:0,alignItems:"center",textAlign:"center"}}>
              <div className="wrap-stamp-title">Scan to<br />collect stamps!</div>
              {showQr && <img className="wrap-qr" src={qrUrl} alt="SYP loyalty registration QR" />}
              <div className="wrap-social">f  ◎  ♪ @SypOnCafe</div>
              <div className="wrap-quote">{item.quote || "Good Drinks, Better Days"}</div>
              <div className="wrap-side-date">{item.orderDateTime ? new Date(item.orderDateTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : ""}</div>
            </div>
          </div>)}
        </div>
      </div>
    </main>
  );
}


function WrapMotif({ theme }: { theme: string }) {
  if (theme === "strawberry") return <svg className="wrap-motif" viewBox="0 0 180 80" aria-label="Detailed strawberry illustration" role="img"><g stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path fill="white" d="M42 24 C31 17 19 23 22 34 C10 48 23 67 43 75 C63 68 77 48 64 34 C67 22 54 17 42 24Z"/><path fill="white" d="M42 25 C30 14 26 9 20 13 C29 23 33 26 42 28 C45 17 52 9 61 13 C59 22 51 26 42 28 C42 17 42 12 42 8"/><path fill="none" d="M25 36 Q34 41 31 49 M60 36 Q51 43 55 50 M31 57 Q40 62 42 70 M52 57 Q46 63 45 70"/><path fill="white" d="M105 29 C95 22 84 28 87 39 C77 51 89 68 106 75 C123 68 136 51 125 39 C128 28 116 22 105 29Z"/><path fill="white" d="M105 29 C96 19 91 17 87 20 C92 27 98 30 105 32 C108 23 115 18 123 21 C120 28 113 31 105 32"/><path fill="none" d="M90 42 Q98 46 96 53 M121 42 Q113 47 116 54 M97 60 Q103 64 105 70"/><g fill="black" stroke="none"><ellipse cx="32" cy="35" rx="1.2" ry="2"/><ellipse cx="48" cy="35" rx="1.2" ry="2"/><ellipse cx="40" cy="43" rx="1.2" ry="2"/><ellipse cx="29" cy="49" rx="1.2" ry="2"/><ellipse cx="53" cy="50" rx="1.2" ry="2"/><ellipse cx="39" cy="57" rx="1.2" ry="2"/><ellipse cx="49" cy="63" rx="1.2" ry="2"/><ellipse cx="99" cy="40" rx="1.1" ry="1.8"/><ellipse cx="112" cy="39" rx="1.1" ry="1.8"/><ellipse cx="105" cy="47" rx="1.1" ry="1.8"/><ellipse cx="94" cy="53" rx="1.1" ry="1.8"/><ellipse cx="117" cy="54" rx="1.1" ry="1.8"/><ellipse cx="104" cy="61" rx="1.1" ry="1.8"/></g></g></svg>;
  if (theme === "coffee") return <img className="wrap-motif" src={COFFEE_BEANS_IMAGE} alt="Detailed coffee bean illustration from the SYP coffee collection" />;
  if (theme === "soda") return <svg className="wrap-motif" viewBox="0 0 180 80" aria-label="Soda bubbles" role="img"><g fill="none" stroke="black" strokeWidth="2"><circle cx="42" cy="43" r="17"/><circle cx="78" cy="23" r="10"/><circle cx="103" cy="51" r="22"/><circle cx="143" cy="25" r="13"/><circle cx="158" cy="59" r="6"/><path d="M35 37q5 -8 10 -2 M73 19q3 -5 6 -1 M94 44q6 -9 12 -2 M137 20q4 -6 7 -1"/></g></svg>;
  if (theme === "matcha") return <svg className="wrap-motif" viewBox="0 0 180 80" aria-label="Matcha leaves" role="img"><g fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M89 72 Q84 43 90 8 Q105 29 89 72Z"/><path d="M88 45 Q57 48 38 18 Q69 13 88 45Z"/><path d="M91 57 Q121 56 145 27 Q113 23 91 57Z"/><path d="M49 25L80 42 M133 32L99 51 M90 20L89 62" fill="none"/></g></svg>;
  return <svg className="wrap-motif" viewBox="0 0 180 80" aria-label="Drink sparkle" role="img"><g fill="none" stroke="black" strokeWidth="2"><path d="M42 20l5 13 13 5 -13 5 -5 13 -5 -13 -13 -5 13 -5Z M127 12l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4Z"/><circle cx="91" cy="58" r="11"/></g></svg>;
}
function WrapArt({ quote, showQr, qrUrl, drinkName, price, cup, customerName, orderNumber, orderDateTime, theme }: { quote: string; showQr: boolean; qrUrl: string; drinkName: string; price: string; cup: string; customerName: string; orderNumber: string; orderDateTime: string; theme: string }) {
  return (
    <div className={`wrap-art theme-${theme}`}>
      <div className="wrap-block">
        <div className="wrap-script">Thank you ♥<br />for supporting<br />local &amp; choosing<br />SYP ON CAFÉ.</div>
        <WrapMotif theme={theme} />
        <div className="wrap-amenities"><span>FREE WI-FI</span><span>BOARD GAMES</span><span>YOUTUBE &amp; NETFLIX</span></div>
      </div>
      <div className="wrap-block" style={{alignItems:"center",textAlign:"center"}}>
        <WrapMotif theme={theme} />
        <img className="wrap-print-logo" src={LOGO_URL} alt="SYP ON CAFÉ" />
        <div className="wrap-brand">SYP ON CAFÉ</div>
        <div className="wrap-tag">— STREET • ICED • BREWED —</div>
        <div className="wrap-drink">{drinkName || "YOUR DRINK"}</div>
        <div className="wrap-order-box">ORDER #{orderNumber || "—"}<br />{cup} · ₱{price}</div>
        {customerName ? <div className="wrap-order-meta">FOR: {customerName}</div> : null}
      </div>
      <div className="wrap-block" style={{borderRight:0,paddingRight:0,alignItems:"center",textAlign:"center"}}>
        <div className="wrap-stamp-title">Scan to<br />collect stamps!</div>
        {showQr && <img className="wrap-qr" src={qrUrl} alt="SYP loyalty registration QR" />}
        <div className="wrap-social">f  ◎  ♪ @SypOnCafe</div>
        <div className="wrap-quote">{quote || "Good Drinks, Better Days"}</div>
        <div className="wrap-side-date">{orderDateTime ? new Date(orderDateTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : ""}</div>
      </div>
    </div>
  );
}
